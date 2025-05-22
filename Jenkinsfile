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
      }
    }

    stage('Release to Production') {
      steps {
    echo '🚢 Releasing to production...'
    bat 'docker tag task-manager-app your-dockerhub-username/task-manager:latest'
    bat 'docker push your-dockerhub-username/task-manager:latest'
    }
}

   stage('Monitoring') {
  steps {
    echo '📈 Monitoring container stats...'
    bat 'docker stats --no-stream'
  }
}


  post {
    always {
      echo '🔚 Pipeline finibated.'
    }
  }
}
