param([int]$TargetPid,[ValidateSet('save','quit')][string]$Action,[string]$Destination)
$ErrorActionPreference='Stop'
Write-Output "Native helper starting: $Action for PID $TargetPid"
Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class ArenaWindows {
 public delegate bool Callback(IntPtr hwnd, IntPtr param);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
 [DllImport("user32.dll")] public static extern bool EnumWindows(Callback callback, IntPtr param);
 [DllImport("user32.dll")] public static extern bool EnumChildWindows(IntPtr parent, Callback callback, IntPtr param);
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
 [DllImport("user32.dll")] public static extern int GetDlgCtrlID(IntPtr hwnd);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr hwnd, StringBuilder text, int count);
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int count);
 [DllImport("user32.dll", CharSet=CharSet.Unicode, SetLastError=true)] public static extern IntPtr SendMessageTimeout(IntPtr hwnd, uint message, IntPtr wparam, string text, uint flags, uint timeout, out IntPtr result);
 [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr hwnd, uint message, IntPtr wparam, IntPtr lparam);
}
'@
Write-Output 'Native control APIs ready.'
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
$script:filename=[IntPtr]::Zero;$script:save=[IntPtr]::Zero
$expected=[System.IO.Path]::GetFileName($Destination)
$stem=[System.IO.Path]::GetFileNameWithoutExtension($Destination)
[ArenaWindows]::EnumChildWindows($dialog,{param($handle,$unused)
 $class=New-Object System.Text.StringBuilder 256
 $text=New-Object System.Text.StringBuilder 2048
 [void][ArenaWindows]::GetClassName($handle,$class,256)
 [void][ArenaWindows]::GetWindowText($handle,$text,2048)
 $id=[ArenaWindows]::GetDlgCtrlID($handle)
 if($class.ToString() -eq 'Edit' -and $text.ToString() -in @($expected,$stem)){$script:filename=$handle}
 if($class.ToString() -eq 'Button' -and $id -eq 1 -and $text.ToString() -match '^&?Save'){$script:save=$handle}
 if($class.ToString() -in @('Edit','Button')){Write-Host "Native $class id=$id text=[$text]"}
 return $true
},[IntPtr]::Zero) | Out-Null
if($script:filename -eq [IntPtr]::Zero -or $script:save -eq [IntPtr]::Zero){throw 'Native filename or Save control not found'}
# Operate the visible native edit/button controls; never invoke application IPC.
[void][ArenaWindows]::SetForegroundWindow($dialog)
[IntPtr]$result=[IntPtr]::Zero
if([ArenaWindows]::SendMessageTimeout($script:filename,0x000C,[IntPtr]::Zero,$Destination,2,3000,[ref]$result) -eq [IntPtr]::Zero){throw 'Native filename edit did not respond'}
if(-not [ArenaWindows]::PostMessage($script:save,0x00F5,[IntPtr]::Zero,[IntPtr]::Zero)){throw 'Native Save button could not be clicked'}
Write-Output 'Native Save submitted.'
