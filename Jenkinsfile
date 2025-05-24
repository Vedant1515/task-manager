pipeline {
  agent any

  tools {
    jdk 'Java-21'
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
        bat "docker build -t %DOCKER_IMAGE% ."
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
        withSonarQubeEnv('MySonarQube') {
          bat 'npm run test -- --coverage'
          bat 'npx sonar-scanner'
        }
      }
    }

    stage('Security') {
      steps {
        echo '🛡️ Running security scans...'
        bat 'npm audit --json > audit-report.json || exit /b 0'
        // bat 'docker run --rm -v %cd%:/project aquasec/trivy:latest fs /project > trivy-report.txt || exit /b 0'
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
          bat 'docker rm -f task-manager-api task-manager-test task-manager-mongo task-manager-prometheus task-manager-grafana task-manager-alertmanager 2>nul || exit /b 0'

          bat 'docker-compose up -d'

          echo '✅ Verifying health endpoint...'
          bat 'call healthcheck.bat'
      }
    }
stage('Release to Production') {
  when {
    expression { currentBuild.currentResult == 'SUCCESS' }
  }
  steps {
    echo '🚀 Releasing to production...'
    withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
      bat "docker login -u %DOCKER_USER% -p %DOCKER_PASS%"
      bat "docker tag task-manager-app vedant1515/task-manager-app:latest"
      bat "docker push vedant1515/task-manager-app:latest"
    }
  }
}


    stage('Monitoring') {
      when {
        expression { currentBuild.currentResult == 'SUCCESS' }
      }
      steps {
        echo '📈 Monitoring enabled...'
        bat 'docker ps -a --filter "name=task-manager"'
        bat 'docker logs task-manager-prometheus || exit /b 0'
        bat 'docker logs task-manager-grafana || exit /b 0'
        bat 'docker logs task-manager-alertmanager || exit /b 0'


        // Add Prometheus/Grafana setup if required
      }
    }
  }

  post {
    
    success {
      echo '✅ Pipeline completed successfully!'
    }
    failure {
      echo '❌ Pipeline failed.'
    }
  }
}
