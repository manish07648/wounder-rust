pipeline {
    agent any

    environment {
        // Tera Asli Docker Hub Username
        DOCKER_USER = "manishmandal07"
        
        // Har build ke sath ek naya tag banega (e.g., v15, v16)
        IMAGE_TAG = "v${env.BUILD_NUMBER}"
        
        // Tera Naya Token wala Credential ID
        CREDENTIALS_ID = "docker-hub-creds" 
    }

    stages {
        stage("Checkout Code") {
            steps {
                echo "GitHub se code download ho raha hai..."
                git branch: "main", url: "https://github.com/manish07648/wounder-rust.git"
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
                sh """
                # K8s files mein purane image tag ko naye tag se replace karna
                sed -i "s|image: ${DOCKER_USER}/wanderlust-frontend:.*|image: ${DOCKER_USER}/wanderlust-frontend:${IMAGE_TAG}|g" kubernetes/frontend.yaml
                sed -i "s|image: ${DOCKER_USER}/wanderlust-backend:.*|image: ${DOCKER_USER}/wanderlust-backend:${IMAGE_TAG}|g" kubernetes/backend.yaml
                
                # GitHub par naya version push karna
                git config user.email "jenkins@devops.com"
                git config user.name "Jenkins Pipeline"
                git add kubernetes/frontend.yaml kubernetes/backend.yaml
                git commit -m "Jenkins: Updated images to ${IMAGE_TAG}"
                
                git push origin main
                """
            }
        }
    }
}
