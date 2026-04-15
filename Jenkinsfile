pipeline {
    // 1. Agent define karta hai ki pipeline kahan run hogi
    agent any 
    
    // 2. Tools block Jenkins ko batata hai ki kon se external tools use karne hain
    tools {
        sonarqubeScanner 'sonar-scanner' // Tumhara banaya hua Sonar Scanner
        dependencyCheck 'DP-Check'       // Tumhara OWASP plugin
    }
    
    // 3. Environment variables jo puri pipeline mein use honge
    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        // TODO: Apna DockerHub username yahan daalo
        DOCKER_USER = "your_dockerhub_username" 
    }
    
    // 4. Parameters taaki build trigger karte time version tag specify kar sako
    parameters {
        string(name: 'IMAGE_TAG', defaultValue: 'v1.0', description: 'Docker Image Tag')
    }
    
    stages {
        // 5. Purana kachra saaf karne ke liye
        stage("Workspace Cleanup") {
            steps {
                cleanWs()
            }
        }
        
        // 6. GitHub se tumhare e-commerce project ka code pull karna
        stage('Git Checkout') {
            steps {
                // TODO: Apne e-commerce GitHub repo ka link daalo
                git branch: 'main', url: 'https://github.com/your-username/ecommerce-project.git'
            }
        }
        
        // 7. Security: Dependencies mein vulnerabilities check karna
        stage("OWASP Dependency Check") {
            steps {
                dependencyCheck additionalArguments: '--scan ./', odcInstallation: 'DP-Check'
            }
        }
        
        // 8. Security: Server par installed Trivy CLI se files scan karna
        stage("Trivy FS Scan") {
            steps {
                sh "trivy fs . > trivy-report.txt"
            }
        }

        // 9. Code Quality: SonarQube container par code bhejna
        stage("SonarQube Analysis") {
            steps {
                // 'sonar-server' wahi naam hai jo humne Jenkins System mein save kiya tha
                withSonarQubeEnv('sonar-server') {
                    sh "$SCANNER_HOME/bin/sonar-scanner -Dsonar.projectKey=ecommerce-app -Dsonar.projectName=ecommerce-app -Dsonar.sources=."
                }
            }
        }
        
        // 10. Containerization: Docker images build karna
        stage("Docker Build") {
            steps {
                // E-commerce project ke backend aur frontend ki alag images
                sh "docker build -t ${DOCKER_USER}/ecommerce-backend:${params.IMAGE_TAG} ./backend"
                sh "docker build -t ${DOCKER_USER}/ecommerce-frontend:${params.IMAGE_TAG} ./frontend"
            }
        }
    }
}
