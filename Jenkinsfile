pipeline {
  agent any

  environment {
    MONGO_URI = 'mongodb://mongo:27017/taskdb_test'
  }

  tools {
    nodejs 'NodeJS'
  }

  stages {
    stage('Build') {
      steps {
        echo '📦 Installing dependencies...'
        bat 'npm install'

        echo '🐳 Building Docker image...'
        bat 'docker build -t task-manager-app .'
      }
    }

    stage('Test') {
      steps {
        echo '🧪 Running unit tests...'
        bat 'set MONGO_URI=mongodb://localhost:27018/taskdb_test && npm test'
      }
    }

    stage('Code Quality') {
      steps {
        echo '🔍 Running ESLint...'
        bat 'npx eslint src/**/*.js || exit /b 0'
      }
    }

    stage('Deploy to Test') {
  steps {
    echo '🚀 Docker Compose Up...'
    bat 'docker-compose down || exit /b 0'
    bat 'docker-compose -f docker-compose.yml up -d'

    echo '✅ Checking health endpoint...'
    bat '''
      for /L %%i in (1,1,10) do (
        curl -f http://localhost:3002/api/status && exit /b 0
        timeout /T 1 >nul
      )
      echo "❌ Health check failed!"
      exit /b 1
    '''
  }
}

    stage('Release to Production') {
      steps {
        echo '🏷️ Tagging release...'
        bat '''
          git tag -d v1.0.%BUILD_NUMBER% 2>nul
          git tag -a v1.0.%BUILD_NUMBER% -m "Release v1.0.%BUILD_NUMBER%"
          git push origin --tags
        '''

        echo '🚀 Running production container...'
        bat '''
          docker tag task-manager-app task-manager-prod
          docker rm -f task-manager-prod 2>nul || exit /b 0
          docker run -d --name task-manager-prod -p 3003:3000 task-manager-prod
        '''

        echo '🔍 Production health check...'
        bat 'curl -f http://localhost:3003/api/status || exit /b 1'
      }
    }

    stage('Monitoring') {
      steps {
        echo '📈 Prometheus endpoint...'
        bat 'curl -f http://localhost:9092 || exit /b 1'
        bat 'curl -f http://localhost:9092/targets || exit /b 1'

        echo '📊 App metrics endpoint...'
        bat 'curl -f http://localhost:3003/metrics || exit /b 1'
      }
    }
  }

  post {
    always {
      echo '🧹 Cleanup...'
      bat 'docker-compose down || exit /b 0'
      echo '🔚 Pipeline finibated.'
    }
  }
}
