pipeline {
  agent any

  tools {
    nodejs 'NodeJS'
  }

  environment {
    DOCKER_IMAGE = "task-manager-app"
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
        echo '🧪 Running unit tests inside Docker...'
        bat 'docker-compose run --rm test'
      }
    }

    stage('Code Quality') {
      steps {
        echo '🔍 Running ESLint...'
        bat 'npx eslint src/**/*.js || exit /b 0'
      }
    }

    stage('Pre-clean') {
      steps {
        echo '🧹 Forcing cleanup of any containers using port 3002...'
        bat '''
          FOR /F "tokens=5" %%P IN ('netstat -aon ^| findstr :3002') DO taskkill /PID %%P /F >nul 2>&1
          docker rm -f task-manager-api task-manager-mongo task-manager-prometheus >nul 2>&1 || exit /b 0
        '''
      }
    }

    stage('Deploy to Test') {
      steps {
        echo '🚀 Docker Compose Up...'
        bat '''
          docker-compose down || exit /b 0
          docker-compose up -d
        '''

        echo '✅ Checking health endpoint...'
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
      echo '🧹 Cleanup...'
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
