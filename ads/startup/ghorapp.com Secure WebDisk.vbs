' ghorapp.com Secure WebDisk.vbs
'
' 11/17/2006 - Initial write.
' 05/17/2012 - Update for Vista/Win7/Win8

Option Explicit
Dim errReturn, strURL, strDomainPort

' *************************************************************************
' Configurable Variables
' *************************************************************************
strURL = "\\ghorapp.com@SSL@2078\DavWWWRoot" ' This is the URL to the WebDAV share.
strDomainPort = "ghorapp.com@SSL@2078"


' *************************************************************************
' This subroutine searches for the WebDAV service known as 'WebClient' and
'  makes sure that it is configured for automatic startup, and that it is
'  currently running.
' *************************************************************************
Sub ConfigureService()
   Dim objWMIService
   Set objWMIService = GetObject("winmgmts:"_
       & "{impersonationLevel=impersonate}!\\.\root\cimv2")


   ' We only care about one service, so the search is only for
   '    the WebClient service.
   Dim colServiceList
   Set colServiceList = objWMIService.ExecQuery _
      ("Select * from Win32_Service where Name = 'WebClient'")


   ' If more than one service was returned, something is funky.
   ' Likewise, if no services are returned, we shouldn't be running.
   If colServiceList.Count = 1 Then
      Dim objService
      For Each objService in colServiceList
         ' Test to see if the service is scheduled to run on startup, if not, configure it to.
         If objService.StartMode <> "Automatic" Then
            errReturn = objService.Change( , , , , "Automatic")
         End If
         ' Test to see if the service is currently running, if not, start it.
         If objService.State <> "Started" Then
            objService.StartService()
         End If
      Next
   Else
      WScript.Echo "Could not find “WebClient” service."
   End If
End Sub

' *********************************************************************
' This subroutine creates a shortcut to the web disk.
' *********************************************************************

Sub CreateShorty ()
   Dim strName, blnDeleteMode, objWSHShell, strDesktop, oMyShortCut

   MsgBox "Connecting to your WebDisk now; this may take a minute.", 64, "Connecting to Webdisk"

   strName = "ghorapp.com Secure WebDisk"
   Set objWshShell = CreateObject("WScript.Shell")
   Const MAXIMIZE_WINDOW = 3

   strDesktop = objWshShell.SpecialFolders("Desktop")
   Set oMyShortCut = objWshShell.CreateShortcut(strDesktop & "\" & strName & ".lnk")
   oMyShortCut.IconLocation = "%SystemRoot%\system32\SHELL32.dll,9"
   oMyShortCut.TargetPath = strURL
   oMyShortCut.Description = strName
   oMyShortCut.WorkingDirectory = strDomainPort
   oMyShortCut.Save

   objWshShell.Run chr(34) & strDesktop & "\" & strName & ".lnk" & chr(34), MAXIMIZE_WINDOW

End Sub




' *********************************************************************
' This subroutine opens Windows Explorer to My Network Places to show
' the location of the web disk.
' *********************************************************************

' *********************************************************************
' Main Function Area.  This is where it all goes down.
' *********************************************************************
ConfigureService
CreateShorty
