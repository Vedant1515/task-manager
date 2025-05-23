pipeline {
  agent any

  environment {
    MONGO_URI = 'mongodb://localhost:27018/taskdb_test'
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
        echo '🔍 Running ESLint for code quality...'
        bat 'npx eslint src/**/*.js || exit /b 0'
      }
    }

    stage('Security Scan') {
      steps {
        withEnv(["PATH+EXTRA=${tool 'NodeJS'}\\bin"]) {
          echo '🔐 Running npm audit...'
          bat 'npm audit || exit /b 0'

          echo '🔐 Running Trivy scan on Docker image...'
          bat 'trivy image --timeout 10m --scanners vuln task-manager-app || exit /b 0'
        }
      }
    }

    stage('Deploy to Test') {
      steps {
        echo '🚀 Deploying to test environment using Docker Compose...'
        bat 'docker-compose -f docker-compose.yml up -d'

        echo '🔍 Verifying app health in test environment...'
        bat 'curl -f http://localhost:3002/api/status || exit /b 1'
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
          docker run -d --name task-manager-prod -p 3003:3000 task-manager-prod
        '''

        echo '✅ Verifying production deployment...'
        bat 'curl -f http://localhost:3003/api/status || exit /b 1'
      }
    }

    stage('Monitoring') {
      steps {
        echo '📈 Verifying Prometheus monitoring endpoint...'
        bat 'curl -f http://localhost:9091 || exit /b 1'
        bat 'curl -f http://localhost:9091/targets || exit /b 1'

        echo '📊 Ensure /metrics endpoint is live...'
        bat 'curl -f http://localhost:3003/metrics || exit /b 1'
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
