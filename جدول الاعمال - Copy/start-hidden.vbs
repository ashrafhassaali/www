Set WshShell = CreateObject("WScript.Shell")
' تحديد مسار المجلد الذي يحتوي على الملف
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strPath

' تشغيل الباتش أو السكريبت بدون ظهور نافذة سوداء
WshShell.Run "start.bat", 0, False