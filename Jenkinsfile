pipeline {
  agent any

  environment {
    MONGO_URI = 'mongodb://localhost:27021/taskdb_test' // ✅ Updated test DB port
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
        bat 'set MONGO_URI=mongodb://localhost:27021/taskdb_test && npm test' // ✅ Updated port
      }
    }

    stage('Code Quality') {
      steps {
        echo '🔍 Running ESLint for code quality...'
        bat 'npx eslint src/**/*.js || exit /b 0'
      }
    }

    stage('Deploy to Test') {
      steps {
        echo '🚀 Deploying to test environment using Docker Compose...'
        bat 'docker-compose -f docker-compose.yml up -d'

        echo '🔍 Verifying app health in test environment...'
        bat 'curl -f http://localhost:3003/api/status || exit /b 1' // ✅ Updated port
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

        echo '🚀 Deploying production container...'
        bat '''
          docker tag task-manager-app task-manager-prod
          docker rm -f task-manager-prod 2>nul || exit /b 0
          docker run -d --name task-manager-prod -p 3004:3000 task-manager-prod
        '''

        echo '✅ Verifying production deployment...'
        bat 'curl -f http://localhost:3004/api/status || exit /b 1' // ✅ Adjusted port to avoid conflict
      }
    }

    stage('Monitoring') {
      steps {
        echo '📈 Verifying Prometheus monitoring endpoint...'
        bat 'curl -f http://localhost:9092 || exit /b 1' // ✅ Updated Prometheus port
        bat 'curl -f http://localhost:9092/targets || exit /b 1'

        echo '📊 Ensure /metrics endpoint is live...'
        bat 'curl -f http://localhost:3004/metrics || exit /b 1' // ✅ Updated to production port
      }
    }
  }

  post {
    always {
      echo '🔚 Pipeline finibated.'
      bat 'docker-compose down || exit /b 0'
    }
  }
}
