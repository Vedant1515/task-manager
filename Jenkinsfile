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
        bat 'docker run --rm -v %cd%:/project aquasec/trivy:latest fs /project > trivy-report.txt || exit /b 0'
      }
    }

    stage('Pre-clean') {
      steps {
        echo '🧹 Cleaning up containers...'
        bat 'docker-compose down || exit /b 0'
        bat 'docker-compose down -v --remove-orphans || exit /b 0'

      }
    }

stage('Deploy to Test') {
  steps {
    echo '🚀 Spinning up containers for testing...'
    bat 'docker-compose up -d'

    echo '✅ Verifying health endpoint...'
    bat '''
    call curl -s -o nul -f http://localhost:3002/api/status || ^
    timeout /T 2 >nul && ^
    curl -s -o nul -f http://localhost:3002/api/status || ^
    timeout /T 2 >nul && ^
    curl -s -o nul -f http://localhost:3002/api/status || ^
    timeout /T 2 >nul && ^
    curl -s -o nul -f http://localhost:3002/api/status || ^
    timeout /T 2 >nul && ^
    curl -s -o nul -f http://localhost:3002/api/status || ^
    timeout /T 2 >nul && ^
    curl -s -o nul -f http://localhost:3002/api/status || ^
    timeout /T 2 >nul && ^
    curl -s -o nul -f http://localhost:3002/api/status || ^
    timeout /T 2 >nul && ^
    curl -s -o nul -f http://localhost:3002/api/status || ^
    ( echo ❌ Health check failed! & exit /b 1 )
    '''
  }
}


    stage('Release to Production') {
      when {
        expression { currentBuild.currentResult == 'SUCCESS' }
      }
      steps {
        echo '🚀 Releasing to production...'
        // Optional: Add Docker push or tagging here
      }
    }

    stage('Monitoring') {
      when {
        expression { currentBuild.currentResult == 'SUCCESS' }
      }
      steps {
        echo '📈 Monitoring setup complete.'
        // Optional: Add Prometheus/Grafana hook or alert setup
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
