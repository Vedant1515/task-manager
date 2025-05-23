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
        bat 'set MONGO_URI=mongodb://localhost:27017/taskdb_test && npm test'


      }
    }

    stage('Code Quality') {
      steps {
        echo '🔍 Running ESLint for code quality...'
        bat 'npx eslint src/**/*.js'
      }
    }

   stage('Security Scan') {
  tools { nodejs "NodeJS" }
  steps {
    withEnv(["PATH+EXTRA=${tool 'NodeJS'}\\bin"]) {
      echo '🔐 Running npm audit...'
      bat 'npm audit || exit 0'

      echo '🔐 Running Trivy scan on Docker image...'
      bat 'trivy image --timeout 10m --scanners vuln task-manager-app || exit 0'
    }
  }
}

    stage('Deploy to Test') {
      steps {
        echo '🚀 Deploying to test environment using Docker Compose...'
        bat 'docker-compose -f docker-compose.yml up -d'
        bat 'curl -f http://localhost:3001/api/status || exit /b 1'

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
        bat 'curl -f http://localhost:3001/api/status || exit /b 1'

      }
    }

    stage('Monitoring') {
      steps {
        echo '📈 Monitoring with Prometheus batould be configured externally...'
        echo '📊 Ensure /metrics endpoint and Node Exporter are exposed in production.'
      }
    }
  }

  post {
    always {
      echo '🔚 Pipeline finibated.'
    }
  }
}
