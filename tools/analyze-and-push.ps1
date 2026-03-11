param(
  [switch]$Push,
  [switch]$WithTests,
  [string]$Message = 'chore: automated analysis update'
)

$ErrorActionPreference = 'Stop'

$rootDir = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $rootDir

$reportPath = Join-Path $rootDir 'analysis-report.latest.md'
$startedAt = Get-Date

function Extract-Issues {
  param([string[]]$Lines)

  $pattern = '(error|failed|exception|not found|invalid|cannot|unable|missing)'
  $matches = @()

  foreach ($line in $Lines) {
    $trimmed = $line.Trim()
    if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }
    if ($trimmed -match $pattern) {
      if ($matches -notcontains $trimmed) {
        $matches += $trimmed
      }
      if ($matches.Count -ge 20) { break }
    }
  }

  if ($matches.Count -gt 0) { return $matches }
  if ($Lines.Count -eq 0) { return @('No error output captured.') }

  if ($Lines.Count -le 12) { return $Lines }
  return $Lines[($Lines.Count - 12)..($Lines.Count - 1)]
}

function Get-Tail {
  param(
    [string[]]$Lines,
    [int]$Count
  )

  if ($Lines.Count -le $Count) { return $Lines }
  return $Lines[($Lines.Count - $Count)..($Lines.Count - 1)]
}

function Run-Check {
  param(
    [string]$Name,
    [string]$Command,
    [string[]]$Arguments,
    [hashtable]$EnvVars
  )

  $start = Get-Date
  Write-Host ''
  Write-Host "[analyze] Running: $Name"

  $previousEnv = @{}
  foreach ($key in $EnvVars.Keys) {
    $previousEnv[$key] = [Environment]::GetEnvironmentVariable($key, 'Process')
    [Environment]::SetEnvironmentVariable($key, $EnvVars[$key], 'Process')
  }

  $outputLines = @()
  $exitCode = 0
  try {
    $outputLines = & $Command @Arguments 2>&1 | ForEach-Object { $_.ToString() }
    if ($null -ne $LASTEXITCODE) {
      $exitCode = [int]$LASTEXITCODE
    }
  } catch {
    $outputLines += $_.Exception.Message
    $exitCode = 1
  }

  foreach ($key in $EnvVars.Keys) {
    [Environment]::SetEnvironmentVariable($key, $previousEnv[$key], 'Process')
  }

  $outputLines | ForEach-Object { Write-Host $_ }

  $finished = Get-Date
  $ok = $exitCode -eq 0
  if ($ok) {
    Write-Host "[analyze] Passed: $Name"
  } else {
    Write-Host "[analyze] Failed: $Name" -ForegroundColor Red
  }

  $issues = @()
  if (-not $ok) {
    $issues = Extract-Issues -Lines $outputLines
  }

  return [pscustomobject]@{
    Name = $Name
    Command = "$Command $($Arguments -join ' ')"
    Ok = $ok
    ExitCode = $exitCode
    Started = $start.ToString('o')
    Finished = $finished.ToString('o')
    Issues = $issues
    OutputTail = Get-Tail -Lines $outputLines -Count 60
  }
}

function Invoke-Git {
  param([string[]]$Arguments)

  $outputLines = & git @Arguments 2>&1 | ForEach-Object { $_.ToString() }
  $exitCode = 0
  if ($null -ne $LASTEXITCODE) {
    $exitCode = [int]$LASTEXITCODE
  }

  return [pscustomobject]@{
    Output = $outputLines
    ExitCode = $exitCode
    Ok = ($exitCode -eq 0)
  }
}

function Run-PushFlow {
  param([string]$CommitMessage)

  Write-Host ''
  Write-Host '[analyze] Running git push flow...'

  $branchResult = Invoke-Git -Arguments @('branch', '--show-current')
  $branchResult.Output | ForEach-Object { Write-Host $_ }
  if (-not $branchResult.Ok) {
    return 'Push failed: unable to detect current branch.'
  }

  $branch = (($branchResult.Output | Select-Object -First 1) -as [string]).Trim()
  if ([string]::IsNullOrWhiteSpace($branch)) {
    return 'Push failed: branch name is empty.'
  }

  $statusResult = Invoke-Git -Arguments @('status', '--porcelain')
  if (-not $statusResult.Ok) {
    return 'Push failed: unable to read git status.'
  }
  $hasChanges = ($statusResult.Output | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }).Count -gt 0

  if ($hasChanges) {
    $addResult = Invoke-Git -Arguments @('add', '-A')
    if (-not $addResult.Ok) {
      return 'Push failed: git add did not complete.'
    }

    $commitResult = Invoke-Git -Arguments @('commit', '-m', $CommitMessage)
    $commitResult.Output | ForEach-Object { Write-Host $_ }
    if (-not $commitResult.Ok) {
      $commitOutput = ($commitResult.Output -join "`n")
      if ($commitOutput -match 'nothing to commit') {
        Write-Host '[analyze] Nothing to commit.'
      } else {
        return 'Push failed: git commit did not complete.'
      }
    } else {
      Write-Host '[analyze] Commit created.'
    }
  } else {
    Write-Host '[analyze] No local file changes to commit.'
  }

  $pushResult = Invoke-Git -Arguments @('push', 'origin', $branch)
  $pushResult.Output | ForEach-Object { Write-Host $_ }
  if (-not $pushResult.Ok) {
    return "Push failed on branch $branch."
  }

  return "Push completed to origin/$branch."
}

$checks = @(
  @{
    Name = 'Build check'
    Command = 'npm'
    Args = @('run', 'build')
    Env = @{}
  }
)

if ($WithTests) {
  $checks += @{
    Name = 'Test check'
    Command = 'npm'
    Args = @('run', 'test', '--', '--watchAll=false', '--passWithNoTests')
    Env = @{ CI = 'true' }
  }
}

$results = @()
foreach ($check in $checks) {
  $result = Run-Check -Name $check.Name -Command $check.Command -Arguments $check.Args -EnvVars $check.Env
  $results += $result
  if (-not $result.Ok) { break }
}

$failedChecks = $results | Where-Object { -not $_.Ok }
$analysisOk = ($results.Count -gt 0) -and ($failedChecks.Count -eq 0)

$pushSummary = 'Push not requested.'
if ($Push) {
  if (-not $analysisOk) {
    $pushSummary = 'Push skipped because analysis failed.'
    Write-Host ''
    Write-Host '[analyze] Push skipped because analysis failed.'
  } else {
    $pushSummary = Run-PushFlow -CommitMessage $Message
  }
}

$lines = @()
$lines += '# Analysis Report'
$lines += ''
$lines += "- Started: $($startedAt.ToString('o'))"
$lines += "- Finished: $((Get-Date).ToString('o'))"
$lines += "- Include tests: $($(if ($WithTests) { 'yes' } else { 'no' }))"
$lines += "- Push requested: $($(if ($Push) { 'yes' } else { 'no' }))"
$lines += "- Overall status: $($(if ($analysisOk) { 'PASS' } else { 'FAIL' }))"
$lines += "- Push summary: $pushSummary"
$lines += ''
$lines += '## Checks'
$lines += ''

foreach ($result in $results) {
  $lines += "### $($result.Name)"
  $lines += "- Status: $($(if ($result.Ok) { 'PASS' } else { 'FAIL' }))"
  $lines += "- Command: ``$($result.Command)``"
  $lines += "- Exit code: $($result.ExitCode)"
  $lines += "- Started: $($result.Started)"
  $lines += "- Finished: $($result.Finished)"
  $lines += ''

  if ($result.Issues.Count -gt 0) {
    $lines += 'Issue lines:'
    foreach ($issue in $result.Issues) {
      $lines += "- $issue"
    }
    $lines += ''
  }

  if ($result.OutputTail.Count -gt 0) {
    $lines += 'Output tail:'
    $lines += '```text'
    foreach ($line in $result.OutputTail) {
      $lines += $line
    }
    $lines += '```'
    $lines += ''
  }
}

Set-Content -Path $reportPath -Value (($lines -join "`n") + "`n") -Encoding UTF8
Write-Host ''
Write-Host "[analyze] Report written: $reportPath"

if (-not $analysisOk) {
  Write-Host '[analyze] Issues found.' -ForegroundColor Red
  exit 1
}

Write-Host '[analyze] Analysis completed with no blocking issues.'
exit 0
