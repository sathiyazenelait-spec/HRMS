$ErrorActionPreference = "Stop"

# Create .dev-tools folder
$devToolsDir = Join-Path $pwd ".dev-tools"
if (!(Test-Path $devToolsDir)) {
    New-Item -ItemType Directory -Path $devToolsDir | Out-Null
    Write-Host "Created .dev-tools folder."
}

# Download Maven 3.9.6
$mavenZip = Join-Path $devToolsDir "maven.zip"
$mavenUrl = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
if (!(Test-Path $mavenZip)) {
    Write-Host "Downloading Maven from $mavenUrl..."
    Invoke-WebRequest -Uri $mavenUrl -OutFile $mavenZip
    Write-Host "Downloaded Maven ZIP."
}

# Download JDK 21
$jdkZip = Join-Path $devToolsDir "jdk21.zip"
$jdkUrl = "https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse"
if (!(Test-Path $jdkZip)) {
    Write-Host "Downloading JDK 21 from $jdkUrl..."
    Invoke-WebRequest -Uri $jdkUrl -OutFile $jdkZip
    Write-Host "Downloaded JDK 21 ZIP."
}

# Extract Maven
$mavenExtractedDir = Join-Path $devToolsDir "apache-maven-3.9.6"
if (!(Test-Path $mavenExtractedDir)) {
    Write-Host "Extracting Maven ZIP..."
    Expand-Archive -Path $mavenZip -DestinationPath $devToolsDir -Force
    Write-Host "Extracted Maven."
} else {
    Write-Host "Maven is already extracted."
}

# Extract JDK 21
$jdkExtractedDirs = Get-ChildItem -Path $devToolsDir -Filter "jdk-21*"
if ($jdkExtractedDirs.Count -eq 0) {
    Write-Host "Extracting JDK 21 ZIP..."
    Expand-Archive -Path $jdkZip -DestinationPath $devToolsDir -Force
    Write-Host "Extracted JDK 21."
} else {
    Write-Host "JDK 21 is already extracted."
}

Write-Host "Setup complete!"
