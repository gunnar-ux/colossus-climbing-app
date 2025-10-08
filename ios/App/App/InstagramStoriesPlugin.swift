import Foundation
import Capacitor
import UIKit

/**
 * Instagram Stories sharing plugin for Capacitor
 * Implements Meta's documented approach for iOS Instagram Stories sharing
 */
@objc(InstagramStoriesPlugin)
public class InstagramStoriesPlugin: CAPPlugin {
    
    @objc func shareToStories(_ call: CAPPluginCall) {
        guard let imageDataString = call.getString("imageData"),
              let appId = call.getString("appId") else {
            call.reject("Missing required parameters")
            return
        }
        
        // Convert base64 string to Data
        guard let imageData = Data(base64Encoded: imageDataString) else {
            call.reject("Invalid image data")
            return
        }
        
        // Check if Instagram is available
        guard let instagramURL = URL(string: "instagram-stories://share?source_application=\(appId)"),
              UIApplication.shared.canOpenURL(instagramURL) else {
            call.reject("Instagram not available")
            return
        }
        
        DispatchQueue.main.async {
            self.shareImageToInstagramStories(imageData: imageData, appId: appId, call: call)
        }
    }
    
    @objc func canOpenInstagram(_ call: CAPPluginCall) {
        let instagramURL = URL(string: "instagram-stories://share")
        let available = instagramURL != nil && UIApplication.shared.canOpenURL(instagramURL!)
        
        call.resolve([
            "available": available
        ])
    }
    
    private func shareImageToInstagramStories(imageData: Data, appId: String, call: CAPPluginCall) {
        // Create the Instagram Stories URL with app ID
        guard let instagramURL = URL(string: "instagram-stories://share?source_application=\(appId)") else {
            call.reject("Invalid Instagram URL")
            return
        }
        
        // Set up pasteboard items as per Meta's documentation
        let pasteboardItems: [[String: Any]] = [
            [
                "com.instagram.sharedSticker.backgroundImage": imageData
            ]
        ]
        
        // Set pasteboard options with expiration (5 minutes as per Meta docs)
        let pasteboardOptions: [UIPasteboard.OptionsKey: Any] = [
            .expirationDate: Date().addingTimeInterval(60 * 5)
        ]
        
        // Set the pasteboard items
        UIPasteboard.general.setItems(pasteboardItems, options: pasteboardOptions)
        
        // Open Instagram Stories
        UIApplication.shared.open(instagramURL, options: [:]) { success in
            if success {
                call.resolve([
                    "success": true,
                    "message": "Instagram Stories opened successfully"
                ])
            } else {
                call.reject("Failed to open Instagram Stories")
            }
        }
    }
}
