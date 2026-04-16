pipeline {
    agent any

    environment {
        // Tera Asli Docker Hub Username
        DOCKER_USER = "manishmandal07"
        
        // Har build ke sath ek naya tag banega (e.g., v15, v16)
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
        
        // Tera Naya Token wala Credential ID (Docker Hub ke liye)
        CREDENTIALS_ID = "docker-hub-creds" 
    }

    stages {
        stage("Checkout Code") {
            steps {
                echo "GitHub se code download ho raha hai..."
                git branch: "main", url: "https://github.com/manish07648/wounder-rust.git"
            }
        }

        // 🛡️ SECURITY STAGE 1: OWASP Dependency Check
        stage('OWASP Dependency Check') {
            steps {
                script {
                    dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'owasp'
                }
            }
        }

        // 🛡️ SECURITY STAGE 2: Trivy FS Scan
        stage('Trivy FS Scan') {
            steps {
                sh 'trivy fs --format table -o trivy-fs-report.txt .'
            }
        }

        // 🛡️ SECURITY STAGE 3: SonarQube Analysis
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') { 
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=wounder-rust \
                        -Dsonar.sources=. 
                    '''
                }
            }
        }

        stage("Build Frontend & Backend") {
            steps {
                echo "Dono images build ho rahi hain..."
                // Frontend Image Build
                sh "docker build -t ${DOCKER_USER}/wanderlust-frontend:${IMAGE_TAG} ./frontend"
                
                // Backend Image Build
                sh "docker build -t ${DOCKER_USER}/wanderlust-backend:${IMAGE_TAG} ./backend"
            }
        }

        stage("Push to Docker Hub") {
            steps {
                echo "Docker Hub par push in progress....."
                
                // Tera Naya Token use karke Login aur Push
                withCredentials([usernamePassword(
                    credentialsId: "${CREDENTIALS_ID}",
                    usernameVariable: "HUB_USER",
                    passwordVariable: "HUB_PASS"
                )]) {
                    sh '''
                    # Secure tarike se token ke sath login
                    echo $HUB_PASS | docker login -u $HUB_USER --password-stdin
                    
                    # Dono images push karna
                    docker push ${HUB_USER}/wanderlust-frontend:${IMAGE_TAG}
                    docker push ${HUB_USER}/wanderlust-backend:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage("Deploy (Update K8s Manifests)") {
            steps {
                echo "GitOps Deployment - YAML files update ho rahi hain ArgoCD ke liye!"
                
                // GitHub Token use karke Push karna
                withCredentials([usernamePassword(
                    credentialsId: "github-creds",
                    usernameVariable: "GIT_USER",
                    passwordVariable: "GIT_TOKEN"
                )]) {
                    sh """
                    # K8s files mein purane image tag ko naye tag se replace karna
                    sed -i "s|image: ${DOCKER_USER}/wanderlust-frontend:.*|image: ${DOCKER_USER}/wanderlust-frontend:${IMAGE_TAG}|g" kubernetes/frontend.yaml
                    sed -i "s|image: ${DOCKER_USER}/wanderlust-backend:.*|image: ${DOCKER_USER}/wanderlust-backend:${IMAGE_TAG}|g" kubernetes/backend.yaml
                    
                    # Git config setup
                    git config user.email "jenkins@devops.com"
                    git config user.name "Jenkins Pipeline"
                    
                    # Jenkins ko batana ki push kahan aur kis token se karna hai
                    git remote set-url origin https://${GIT_USER}:${GIT_TOKEN}@github.com/manish07648/wounder-rust.git
                    
                    git add kubernetes/frontend.yaml kubernetes/backend.yaml
                    
                    # Smart Commit: Agar change hai toh commit karo, warna chup raho
                    git diff-index --quiet HEAD || git commit -m "Jenkins: Updated images to ${IMAGE_TAG}"
                    
                    # Final Push!
                    git push origin main
                    """
                }
                echo "Deployment Triggered! ArgoCD ab ise auto-sync kar lega."
            }
        }
    }
}
