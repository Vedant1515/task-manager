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
        sh 'npm install'
        echo '🐳 Building Docker image...'
        sh 'docker build -t task-manager-app .'
      }
    }

    stage('Test') {
      steps {
        echo '🧪 Running unit tests...'
        sh 'NODE_ENV=test npm test'
      }
    }

    stage('Code Quality') {
      steps {
        echo '🔍 Running ESLint for code quality...'
        sh 'npx eslint src/**/*.js'
      }
    }

    stage('Security Scan') {
      steps {
        echo '🔐 Running npm audit...'
        sh 'npm audit || true'
        echo '🔐 Running Trivy scan on Docker image...'
        sh 'trivy image task-manager-app || true'
      }
    }

    stage('Deploy to Test') {
      steps {
        echo '🚀 Deploying to test environment using Docker Compose...'
        sh 'docker-compose -f docker-compose.yml up -d'
      }
    }

    stage('Release to Production') {
      steps {
        echo '🏷️ Tagging release...'
        sh 'git tag -a v1.0.${BUILD_NUMBER} -m "Release v1.0.${BUILD_NUMBER}"'
        sh 'git push origin --tags'
      }
    }

    stage('Monitoring') {
      steps {
        echo '📈 Monitoring with Prometheus should be configured externally...'
        echo '📊 Ensure /metrics endpoint and Node Exporter are exposed in production.'
      }
    }
  }

  post {
    always {
      echo '🔚 Pipeline finished.'
    }
  }
}
