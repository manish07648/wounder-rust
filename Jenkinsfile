pipeline {
    agent any

    environment {
        // Tera Asli Docker Hub Username
        DOCKER_USER = "manishmandal07"
        
        // Har build ke sath ek naya tag banega (e.g., v15, v16)
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
        
        // Tera Docker Hub Credentials
        CREDENTIALS_ID = "docker-hub-creds" 
    }

    stages {
        stage("Checkout Code") {
            steps {
                echo "GitHub se code download ho raha hai..."
                git branch: "main", url: "https://github.com/manish07648/wounder-rust.git"
            }
        }

        // 🛡️ SECURITY STAGE 1: OWASP Dependency Check (Slow & Steady Mode - No API Key)
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
                
                // Secure login and push
                withCredentials([usernamePassword(
                    credentialsId: "${CREDENTIALS_ID}",
                    usernameVariable: "HUB_USER",
                    passwordVariable: "HUB_PASS"
                )]) {
                    sh '''
                    echo $HUB_PASS | docker login -u $HUB_USER --password-stdin
                    
                    docker push ${HUB_USER}/wanderlust-frontend:${IMAGE_TAG}
                    docker push ${HUB_USER}/wanderlust-backend:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage("Deploy (Update K8s Manifests)") {
            steps {
                echo "GitOps Deployment - YAML files update ho rahi hain ArgoCD ke liye!"
                
                // GitHub Push
                withCredentials([usernamePassword(
                    credentialsId: "github-creds",
                    usernameVariable: "GIT_USER",
                    passwordVariable: "GIT_TOKEN"
                )]) {
                    sh """
                    sed -i "s|image: ${DOCKER_USER}/wanderlust-frontend:.*|image: ${DOCKER_USER}/wanderlust-frontend:${IMAGE_TAG}|g" kubernetes/frontend.yaml
                    sed -i "s|image: ${DOCKER_USER}/wanderlust-backend:.*|image: ${DOCKER_USER}/wanderlust-backend:${IMAGE_TAG}|g" kubernetes/backend.yaml
                    
                    git config user.email "jenkins@devops.com"
                    git config user.name "Jenkins Pipeline"
                    
                    git remote set-url origin https://${GIT_USER}:${GIT_TOKEN}@github.com/manish07648/wounder-rust.git
                    
                    git add kubernetes/frontend.yaml kubernetes/backend.yaml
                    
                    git diff-index --quiet HEAD || git commit -m "Jenkins: Updated images to ${IMAGE_TAG}"
                    
                    git push origin main
                    """
                }
                echo "Deployment Triggered! ArgoCD ab ise auto-sync kar lega."
            }
        }
    }
}
