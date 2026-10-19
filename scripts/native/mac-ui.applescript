-- CI-only keyboard interaction with the launched test process, never the main inspector.
on run argv
 set targetPid to (item 1 of argv) as integer
 set actionName to item 2 of argv
 tell application "System Events"
  set targetProcess to first application process whose unix id is targetPid
  tell targetProcess
   set frontmost to true
   if actionName is "activate" then
    return name of every window
   else if actionName is "quit" then
    keystroke "q" using command down
   else if actionName is "save" then
    set folderName to item 3 of argv
    repeat 100 times
     if exists sheet 1 of window 1 then exit repeat
     delay 0.1
    end repeat
    if not (exists sheet 1 of window 1) then error "Native save sheet did not appear"
    keystroke "g" using {command down, shift down}
    delay 0.5
    keystroke folderName
    key code 36
    delay 0.5
    key code 36
   else
    error "Unknown native action"
   end if
  end tell
 end tell
end run
