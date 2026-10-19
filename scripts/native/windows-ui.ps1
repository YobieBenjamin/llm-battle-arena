param([int]$TargetPid,[ValidateSet('save','quit')][string]$Action,[string]$Destination)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$condition=New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ProcessIdProperty,$TargetPid)
$root=[System.Windows.Automation.AutomationElement]::RootElement
if($Action -eq 'quit') {
 $window=$root.FindFirst([System.Windows.Automation.TreeScope]::Children,$condition)
 if($null -eq $window){throw 'Test window not found'}
 $window.GetCurrentPattern([System.Windows.Automation.WindowPattern]::Pattern).Close()
 exit
}
$edit=$null;$save=$null
for($i=0;$i -lt 100;$i++) {
 $windows=$root.FindAll([System.Windows.Automation.TreeScope]::Children,$condition)
 foreach($window in $windows) {
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
