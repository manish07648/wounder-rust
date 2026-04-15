pipeline {
    agent any 
    
    tools {
        // Logs ke hisaab se exact registered tool types
        'hudson.plugins.sonar.SonarRunnerInstallation' 'sonar-scanner'
        'dependency-check' 'DP-Check'
    }
    
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        // TODO: Apna DockerHub username update karna
        DOCKER_USER = "your_dockerhub_username" 
    }
    
    parameters {
        string(name: 'IMAGE_TAG', defaultValue: 'v1.0', description: 'Docker Image Tag')
    }
    
    stages {
        stage("Workspace Cleanup") {
            steps {
                cleanWs()
            }
        }
        
        stage('Git Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/manish07648/wounder-rust.git'
            }
        }
        
        stage("OWASP Dependency Check") {
            steps {
                dependencyCheck additionalArguments: '--scan ./', odcInstallation: 'DP-Check'
            }
        }
        
        stage("Trivy FS Scan") {
            steps {
                sh "trivy fs . > trivy-report.txt"
            }
        }

        stage("SonarQube Analysis") {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh "$SCANNER_HOME/bin/sonar-scanner -Dsonar.projectKey=ecommerce-app -Dsonar.projectName=ecommerce-app -Dsonar.sources=."
                }
            }
        }
        
        stage("Docker Build") {
            steps {
                sh "docker build -t ${DOCKER_USER}/ecommerce-backend:${params.IMAGE_TAG} ./backend"
                sh "docker build -t ${DOCKER_USER}/ecommerce-frontend:${params.IMAGE_TAG} ./frontend"
            }
        }
    }
}
