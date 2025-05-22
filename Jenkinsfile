pipeline {
  agent any

  environment {
    MONGODB_URI = 'mongodb://mongo:27017/taskdb'
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
      steps {
        echo '🔐 Running npm audit...'
        bat 'npm audit || true'
        echo '🔐 Running Trivy scan on Docker image...'
        bat 'trivy image task-manager-app || true'
      }
    }

    stage('Deploy to Test') {
      steps {
        echo '🚀 Deploying to test environment using Docker Compose...'
        bat 'docker-compose -f docker-compose.yml up -d'
      }
    }

    stage('Release to Production') {
      steps {
        echo '🏷️ Tagging release...'
        bat 'git tag -a v1.0.${BUILD_NUMBER} -m "Release v1.0.${BUILD_NUMBER}"'
        bat 'git pubat origin --tags'
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
