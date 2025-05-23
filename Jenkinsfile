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
        bat 'docker-compose up -d'

        echo '✅ Verifying health endpoint...'
        bat '''
        @echo off
        set RETRIES=10
        set COUNT=0
        :loop
        curl -s -o nul -f http://localhost:3002/api/status
        if %errorlevel%==0 (
        echo ✅ Health check passed!
        exit /b 0
        )
        set /A COUNT+=1
        if %COUNT% GEQ %RETRIES% (
        echo ❌ Health check failed!
        exit /b 1
        )
        timeout /T 2 >nul
        goto loop
      '''
    }
  } 

    stage('Release to Production') {
      when {
        expression { currentBuild.currentResult == 'SUCCESS' }
      }
      steps {
        echo '🚀 Releasing to production...'
        // Add Docker push or deploy commands here
      }
    }

    stage('Monitoring') {
      when {
        expression { currentBuild.currentResult == 'SUCCESS' }
      }
      steps {
        echo '📈 Monitoring enabled...'
        // Add Prometheus/Grafana setup if required
      }
    }
  }

  post {
    always {
      echo '🧹 Final cleanup...'
      bat 'docker-compose down || exit /b 0'
      bat 'docker-compose down -v --remove-orphans || exit /b 0'
    }
    success {
      echo '✅ Pipeline completed successfully!'
    }
    failure {
      echo '❌ Pipeline failed.'
    }
  }
}
