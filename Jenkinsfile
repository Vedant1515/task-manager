pipeline {
  agent any

  environment {
    DOCKER_IMAGE = "task-manager-app"
    MONGO_URI = "mongodb://localhost:27018/taskdb_test"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Tool Install') {
      tools {
        nodejs 'NodeJS'
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
        echo '🧪 Running unit tests...'
        bat "set MONGO_URI=${env.MONGO_URI} && npm test"
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
        // Add production deployment steps if needed
      }
    }

    stage('Monitoring') {
      when {
        expression { currentBuild.currentResult == 'SUCCESS' }
      }
      steps {
        echo '📈 Monitoring enabled...'
        // Add monitoring logic here if needed
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
