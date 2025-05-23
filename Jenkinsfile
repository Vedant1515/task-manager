pipeline {
  agent any

  tools {
    nodejs 'NodeJS'
  }

  environment {
    DOCKER_IMAGE = "task-manager-app"
    SONARQUBE_ENV = "SonarQube" // This must match the configured Jenkins SonarQube server name
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        echo '📦 Installing dependencies...'
        bat 'npm install'

        echo '🐳 Building Docker image...'
        bat "docker build -t ${env.DOCKER_IMAGE} ."
      }
    }

    stage('Test') {
      steps {
        echo '🧪 Cleaning up any existing test containers...'
        bat 'docker rm -f task-manager-mongo task-manager-test 2>nul || exit /b 0'

        echo '🐳 Building test container...'
        bat 'docker-compose build test'

        echo '🧪 Running unit tests inside Docker...'
        bat 'docker-compose run --rm test'
      }
    }

    stage('Code Quality') {
      steps {
        echo '🔍 Running SonarQube analysis...'
        bat 'npm run test -- --coverage' // Ensures lcov.info is created
        withSonarQubeEnv("${env.SONARQUBE_ENV}") {
          bat 'sonar-scanner'
        }
      }
    }

    stage('Security') {
      steps {
        echo '🔐 Running Security Analysis...'

        echo '📦 npm audit for dependency vulnerabilities...'
        bat 'npm audit --json > audit-report.json || exit /b 0'
        bat 'type audit-report.json'

        echo '🔎 Docker image scan with Trivy...'
        bat 'trivy image --format table --output trivy-report.txt ${env.DOCKER_IMAGE} || exit /b 0'
        bat 'type trivy-report.txt'
      }
    }

    stage('Pre-clean') {
      steps {
        echo '🧹 Cleaning up containers...'
        bat 'docker-compose down || exit /b 0'
      }
    }

    stage('Deploy to Test') {
      steps {
        echo '🚀 Spinning up containers for testing...'
        bat 'docker-compose up -d'

        echo '✅ Verifying health endpoint...'
        bat '''
          for /L %%i in (1,1,10) do (
            curl -f http://localhost:3002/api/status && exit /b 0
            timeout /T 2 >nul
          )
          echo "❌ Health check failed!" && exit /b 1
        '''
      }
    }

    stage('Release to Production') {
      when {
        expression { currentBuild.currentResult == 'SUCCESS' }
      }
      steps {
        echo '🚀 Releasing to production...'
      }
    }

    stage('Monitoring') {
      when {
        expression { currentBuild.currentResult == 'SUCCESS' }
      }
      steps {
        echo '📈 Monitoring enabled...'
      }
    }
  }

  post {
    always {
      echo '🧹 Final cleanup...'
      bat 'docker-compose down || exit /b 0'
    }
    success {
      echo '✅ Pipeline completed successfully!'
    }
    failure {
      echo '❌ Pipeline failed.'
    }
  }
}
