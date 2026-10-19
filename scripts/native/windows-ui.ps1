param([int]$TargetPid,[ValidateSet('save','quit')][string]$Action,[string]$Destination)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class ArenaWindows {
 public delegate bool Callback(IntPtr hwnd, IntPtr param);
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
$edit=$null;$save=$null
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
 foreach($handle in $script:dialogs) {
  $window=[System.Windows.Automation.AutomationElement]::FromHandle($handle)
  Write-Output "Native dialog found: $($window.Current.Name)"
  $all=$window.FindAll([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.Condition]::TrueCondition)
  foreach($element in $all) {
   if($element.Current.ControlType -eq [System.Windows.Automation.ControlType]::Edit -and $element.Current.Name -match '^File name:?$'){$edit=$element}
   if($element.Current.ControlType -eq [System.Windows.Automation.ControlType]::Button -and $element.Current.Name -match '^&?Save$'){$save=$element}
  }
 }
 if($null -ne $edit -and $null -ne $save){break}
 Start-Sleep -Milliseconds 100
}
if($null -eq $edit -or $null -eq $save){throw 'Native Save dialog controls not found'}
$edit.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern).SetValue($Destination)
$save.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
