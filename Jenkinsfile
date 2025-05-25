pipeline {
  agent any

  tools {
    jdk 'Java-21'
    nodejs 'NodeJS'
  }

  environment {
    DOCKER_IMAGE = "task-manager-app"
    BUILD_TAG = "task-manager-app:${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        echo ' Installing dependencies...'
        bat 'npm install'

        echo ' Building Docker image with version tag...'
        bat "docker build -t %BUILD_TAG% ."

        echo ' Committing build tag to version control...'
        bat '''
          git config user.email "ci@taskmanager.com"
          git config user.name "CI Bot"
          git tag build-%BUILD_NUMBER%
          git push origin build-%BUILD_NUMBER%
        '''
      }
    }

    stage('Test') {
      steps {
        echo ' Cleaning up existing test containers...'
        bat 'docker rm -f task-manager-mongo task-manager-test 2>nul || exit /b 0'

        echo '🐳 Building and running unit/integration tests...'
        bat 'docker-compose build test'
        bat 'docker-compose run --rm test'
      }
    }

    stage('Code Quality') {
      steps {
        echo ' Running SonarQube analysis...'
        withSonarQubeEnv('MySonarQube') {
          bat 'npm run test -- --coverage'
          bat 'npx sonar-scanner'
        }
      }
    }

    stage('Security') {
      steps {
        echo ' Running npm audit...'
        bat 'npm audit --json > audit-report.json || exit /b 0'

        echo ' Running Trivy scan on Docker image...'
        bat '''
          trivy image --severity CRITICAL,HIGH --no-progress --exit-code 0 %BUILD_TAG% > trivy-report.txt || exit /b 0
        '''

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
        echo ' Deploying to test environment...'
        bat 'docker-compose up -d --build'

        echo ' Healthcheck verification...'
        bat 'call healthcheck.bat'
      }
    }

    stage('Release to Production') {
      when {
        expression { currentBuild.currentResult == 'SUCCESS' }
      }
      steps {
        echo ' Pushing image to Docker Hub...'
        withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          bat "docker login -u %DOCKER_USER% -p %DOCKER_PASS%"
          bat "docker tag %BUILD_TAG% vedant1515/task-manager-app:latest"
          bat "docker push vedant1515/task-manager-app:latest"
        }
      }
    }

    stage('Monitoring') {
      when {
        expression { currentBuild.currentResult == 'SUCCESS' }
      }
      steps {
        echo 'Monitoring logs...'
        bat 'docker ps -a --filter "name=task-manager"'
        bat 'docker logs task-manager-prometheus || exit /b 0'
        bat 'docker logs task-manager-grafana || exit /b 0'
        bat 'docker logs task-manager-alertmanager || exit /b 0'
      }
    }
  }

  post {
    success {
      echo ' Pipeline completed successfully!'
    }
    failure {
      echo ' Pipeline failed.'
    }
  }
}
