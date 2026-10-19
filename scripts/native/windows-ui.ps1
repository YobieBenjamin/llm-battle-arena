param([int]$TargetPid,[ValidateSet('save','quit')][string]$Action,[string]$Destination)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class ArenaWindows {
 public delegate bool Callback(IntPtr hwnd, IntPtr param);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] public static extern bool EnumWindows(Callback callback, IntPtr param);
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr hwnd, StringBuilder text, int count);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int count);
}
'@
if($Action -eq 'quit') {
 if(-not (Get-Process -Id $TargetPid).CloseMainWindow()){throw 'Could not close test window'}
 exit
}
$dialog=[IntPtr]::Zero
for($i=0;$i -lt 100;$i++) {
 $script:dialogs=@()
 [ArenaWindows]::EnumWindows({param($handle,$unused)
  [uint32]$owner=0
  [void][ArenaWindows]::GetWindowThreadProcessId($handle,[ref]$owner)
  if($owner -eq $TargetPid){
   $class=New-Object System.Text.StringBuilder 256
   [void][ArenaWindows]::GetClassName($handle,$class,256)
   if($class.ToString() -eq '#32770'){$script:dialogs+= $handle}
  }
  return $true
 },[IntPtr]::Zero) | Out-Null
 if($script:dialogs.Count -eq 1){$dialog=$script:dialogs[0];break}
 Start-Sleep -Milliseconds 100
}
if($dialog -eq [IntPtr]::Zero){throw 'Native Save dialog not found'}
[void][ArenaWindows]::SetForegroundWindow($dialog)
Start-Sleep -Milliseconds 200
if([ArenaWindows]::GetForegroundWindow() -ne $dialog){throw 'Test Save dialog could not take keyboard focus'}
# Native dialog keyboard commands: Alt+N selects File name, then Enter saves.
[System.Windows.Forms.SendKeys]::SendWait('%n')
[System.Windows.Forms.SendKeys]::SendWait('^a')
$escaped=''
foreach($character in $Destination.ToCharArray()) {
 if($character -eq '{'){$escaped+='{{}'}
 elseif($character -eq '}'){$escaped+='{}}'}
 elseif('+^%~()[]'.Contains([string]$character)){$escaped+='{'+$character+'}'}
 else{$escaped+=$character}
}
[System.Windows.Forms.SendKeys]::SendWait($escaped)
[System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
Write-Output 'Native Save dialog submitted through keyboard controls.'
