pipeline {
    agent any

    environment {
        DOCKER_USER = "manishmandal07"
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
        CREDENTIALS_ID = "docker-hub-creds" 
    }

    stages {
        stage("Checkout Code") {
            steps {
                git branch: "main", url: "https://github.com/manish07648/wounder-rust.git"
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                script {
                    // --noupdate se ye turant scan khatam karega bina download kiye
                    dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit --nvdApiKey 0fdd9622-8b62-47d7-bd2c-b666dc3c4170 --noupdate', odcInstallation: 'owasp'
                }
            }
        }

        stage('Trivy FS Scan') {
            steps {
                sh 'trivy fs --format table -o trivy-fs-report.txt .'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('sonar-server') { 
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=wounder-rust -Dsonar.sources=. "
                    }
                }
            }
        }

        stage("Build Frontend & Backend") {
            steps {
                sh "docker build -t ${DOCKER_USER}/wanderlust-frontend:${IMAGE_TAG} ./frontend"
                sh "docker build -t ${DOCKER_USER}/wanderlust-backend:${IMAGE_TAG} ./backend"
            }
        }

        stage("Push to Docker Hub") {
            steps {
                withCredentials([usernamePassword(credentialsId: "${CREDENTIALS_ID}", usernameVariable: "HUB_USER", passwordVariable: "HUB_PASS")]) {
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
                withCredentials([usernamePassword(credentialsId: "github-creds", usernameVariable: "GIT_USER", passwordVariable: "GIT_TOKEN")]) {
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
            }
        }
    }
}
