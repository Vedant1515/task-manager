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
        echo '🛡️ Running npm audit...'
        bat 'npm audit --json > audit-report.json || exit /b 0'

        echo '🔐 Running Trivy scan on Docker image...'
        bat '''
          trivy image --severity CRITICAL,HIGH --no-progress --exit-code 0 %DOCKER_IMAGE% > trivy-report.txt || exit /b 0
        '''

        echo '🗂️ Archiving Trivy report...'
        archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
      }
    }

    stage('Pre-clean') {
      steps {
        echo '🧹 Cleaning up all task-manager containers...'
        bat '''
          FOR /F "tokens=*" %%i IN ('docker ps -aq --filter "name=task-manager"') DO docker rm -f %%i 2>nul || exit /b 0
          docker-compose down -v --remove-orphans || exit /b 0
        '''
      }
    }

    stage('Deploy to Test') {
      steps {
        echo '🚀 Spinning up containers for testing...'
        bat 'docker rm -f task-manager-api task-manager-test task-manager-mongo task-manager-prometheus task-manager-grafana task-manager-alertmanager task-manager-blackbox 2>nul || exit /b 0'

        bat 'docker-compose up -d'
        bat 'docker-compose up -d --build'

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
          bat "docker tag %DOCKER_IMAGE% vedant1515/task-manager-app:latest"
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
