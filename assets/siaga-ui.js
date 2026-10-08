/* PANDU UI — ikon (Lucide inline), emoji→ikon, perilaku navbar/drawer/pencarian. Tanpa dependensi. */
(function(){
"use strict";
var ICONS={"home": "<path d=\"m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/>", "megaphone": "<path d=\"m3 11 18-5v12L3 14v-3z\"/><path d=\"M11.6 16.8a3 3 0 1 1-5.8-1.6\"/>", "calendar-days": "<path d=\"M8 2v4\"/><path d=\"M16 2v4\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"/><path d=\"M3 10h18\"/><path d=\"M8 14h.01\"/><path d=\"M12 14h.01\"/><path d=\"M16 14h.01\"/><path d=\"M8 18h.01\"/><path d=\"M12 18h.01\"/><path d=\"M16 18h.01\"/>", "calendar-check": "<path d=\"M8 2v4\"/><path d=\"M16 2v4\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\"/><path d=\"M3 10h18\"/><path d=\"m9 16 2 2 4-4\"/>", "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/>", "user": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>", "user-circle": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/><path d=\"M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662\"/>", "file-text": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/><path d=\"M10 9H8\"/><path d=\"M16 13H8\"/><path d=\"M16 17H8\"/>", "wallet": "<path d=\"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1\"/><path d=\"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4\"/>", "store": "<path d=\"m3 9 1.5-5h15L21 9\"/><path d=\"M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0\"/><path d=\"M4 12v8h16v-8\"/><path d=\"M10 20v-5h4v5\"/>", "images": "<path d=\"M18 22H4a2 2 0 0 1-2-2V6\"/><path d=\"m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18\"/><circle cx=\"12\" cy=\"8\" r=\"2\"/><rect width=\"16\" height=\"16\" x=\"6\" y=\"2\" rx=\"2\"/>", "image": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21\"/>", "triangle-alert": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/><path d=\"M12 9v4\"/><path d=\"M12 17h.01\"/>", "phone": "<path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/>", "bell": "<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\"/><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\"/>", "menu": "<line x1=\"4\" x2=\"20\" y1=\"12\" y2=\"12\"/><line x1=\"4\" x2=\"20\" y1=\"6\" y2=\"6\"/><line x1=\"4\" x2=\"20\" y1=\"18\" y2=\"18\"/>", "x": "<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>", "chevron-right": "<path d=\"m9 18 6-6-6-6\"/>", "chevron-left": "<path d=\"m15 18-6-6 6-6\"/>", "chevron-down": "<path d=\"m6 9 6 6 6-6\"/>", "arrow-right": "<path d=\"M5 12h14\"/><path d=\"m12 5 7 7-7 7\"/>", "arrow-left": "<path d=\"m12 19-7-7 7-7\"/><path d=\"M19 12H5\"/>", "arrow-up-right": "<path d=\"M7 7h10v10\"/><path d=\"M7 17 17 7\"/>", "plus": "<path d=\"M5 12h14\"/><path d=\"M12 5v14\"/>", "message-circle": "<path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\"/>", "lock": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>", "circle-check": "<path d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/><path d=\"m9 11 3 3L22 4\"/>", "check": "<path d=\"M20 6 9 17l-5-5\"/>", "circle-x": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m15 9-6 6\"/><path d=\"m9 9 6 6\"/>", "circle-alert": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"/><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"/>", "info": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/>", "map-pin": "<path d=\"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><polyline points=\"12 6 12 12 16 14\"/>", "credit-card": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\"/><line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\"/>", "banknote": "<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M6 12h.01M18 12h.01\"/>", "coins": "<circle cx=\"8\" cy=\"8\" r=\"6\"/><path d=\"M18.09 10.37A6 6 0 1 1 10.34 18\"/><path d=\"M7 6h1v4\"/><path d=\"m16.71 13.88.7.71-2.82 2.82\"/>", "shield-check": "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/><path d=\"m9 12 2 2 4-4\"/>", "sparkles": "<path d=\"m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z\"/>", "gift": "<rect x=\"3\" y=\"8\" width=\"18\" height=\"4\" rx=\"1\"/><path d=\"M12 8v13\"/><path d=\"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7\"/><path d=\"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5\"/>", "trophy": "<path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"/><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"/><path d=\"M4 22h16\"/><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"/><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"/><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"/>", "trash-2": "<path d=\"M3 6h18\"/><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"/><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"/><line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\"/><line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\"/>", "pencil": "<path d=\"M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z\"/><path d=\"m15 5 4 4\"/>", "download": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\"/>", "upload": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"17 8 12 3 7 8\"/><line x1=\"12\" x2=\"12\" y1=\"3\" y2=\"15\"/>", "printer": "<polyline points=\"6 9 6 2 18 2 18 9\"/><path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"/><rect width=\"12\" height=\"8\" x=\"6\" y=\"14\"/>", "refresh-cw": "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/>", "undo-2": "<path d=\"M9 14 4 9l5-5\"/><path d=\"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11\"/>", "send": "<path d=\"m22 2-7 20-4-9-9-4Z\"/><path d=\"M22 2 11 13\"/>", "camera": "<path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/>", "newspaper": "<path d=\"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2\"/><path d=\"M18 14h-8\"/><path d=\"M15 18h-5\"/><path d=\"M10 6h8v4h-8V6Z\"/>", "clipboard-list": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><path d=\"M12 11h4\"/><path d=\"M12 16h4\"/><path d=\"M8 11h.01\"/><path d=\"M8 16h.01\"/>", "heart": "<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/>", "layout-dashboard": "<rect width=\"7\" height=\"9\" x=\"3\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"5\" x=\"14\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"9\" x=\"14\" y=\"12\" rx=\"1\"/><rect width=\"7\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\"/>", "settings": "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "log-out": "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/><polyline points=\"16 17 21 12 16 7\"/><line x1=\"21\" x2=\"9\" y1=\"12\" y2=\"12\"/>", "star": "<polygon points=\"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2\"/>", "external-link": "<path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>", "wrench": "<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/>", "lightbulb": "<path d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\"/><path d=\"M9 18h6\"/><path d=\"M10 22h4\"/>", "droplets": "<path d=\"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z\"/><path d=\"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97\"/>", "building": "<path d=\"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z\"/><path d=\"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2\"/><path d=\"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2\"/><path d=\"M10 6h4\"/><path d=\"M10 10h4\"/><path d=\"M10 14h4\"/><path d=\"M10 18h4\"/>", "bar-chart": "<line x1=\"12\" x2=\"12\" y1=\"20\" y2=\"10\"/><line x1=\"18\" x2=\"18\" y1=\"20\" y2=\"4\"/><line x1=\"6\" x2=\"6\" y1=\"20\" y2=\"16\"/>", "trending-up": "<polyline points=\"22 7 13.5 15.5 8.5 10.5 2 17\"/><polyline points=\"16 7 22 7 22 13\"/>", "trending-down": "<polyline points=\"22 17 13.5 8.5 8.5 13.5 2 7\"/><polyline points=\"16 17 22 17 22 11\"/>", "mail": "<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\"/><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\"/>", "eye": "<path d=\"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "receipt": "<path d=\"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z\"/><path d=\"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8\"/><path d=\"M12 17.5v-11\"/>", "zap": "<path d=\"M13 2 3 14h9l-1 8 10-12h-9l1-8z\"/>", "quote": "<path d=\"M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z\"/><path d=\"M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z\"/>", "target": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>", "pin": "<line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"22\"/><path d=\"M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z\"/>", "link": "<path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/>", "shopping-bag": "<path d=\"M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z\"/><path d=\"M3 6h18\"/><path d=\"M16 10a4 4 0 0 1-8 0\"/>", "activity": "<path d=\"M22 12h-4l-3 9L9 3l-3 9H2\"/>", "leaf": "<path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z\"/><path d=\"M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12\"/>", "utensils": "<path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\"/><path d=\"M7 2v20\"/><path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7\"/>", "hand-coins": "<path d=\"M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16\"/><path d=\"m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\"/><path d=\"m2 16 6 6\"/><circle cx=\"16\" cy=\"9\" r=\"2.9\"/><circle cx=\"6\" cy=\"5\" r=\"3\"/>", "truck": "<path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"/><path d=\"M15 18H9\"/><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/>", "bot": "<path d=\"M12 8V4H8\"/><rect width=\"16\" height=\"12\" x=\"4\" y=\"8\" rx=\"2\"/><path d=\"M2 14h2\"/><path d=\"M20 14h2\"/><path d=\"M15 13v2\"/><path d=\"M9 13v2\"/>", "dot": "<circle cx=\"12\" cy=\"12\" r=\"5\" fill=\"currentColor\"/>", "smartphone": "<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\"/><path d=\"M12 18h.01\"/>", "briefcase": "<path d=\"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\"/><rect width=\"20\" height=\"14\" x=\"2\" y=\"6\" rx=\"2\"/>", "flask-conical": "<path d=\"M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2\"/><path d=\"M8.5 2h7\"/><path d=\"M7 16h10\"/>", "lock-open": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 9.9-1\"/>", "package": "<path d=\"m7.5 4.27 9 5.15\"/><path d=\"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z\"/><path d=\"m3.3 7 8.7 5 8.7-5\"/><path d=\"M12 22V12\"/>", "paperclip": "<path d=\"m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48\"/>", "arrow-down": "<path d=\"M12 5v14\"/><path d=\"m19 12-7 7-7-7\"/>", "landmark": "<line x1=\"3\" x2=\"21\" y1=\"22\" y2=\"22\"/><line x1=\"6\" x2=\"6\" y1=\"18\" y2=\"11\"/><line x1=\"10\" x2=\"10\" y1=\"18\" y2=\"11\"/><line x1=\"14\" x2=\"14\" y1=\"18\" y2=\"11\"/><line x1=\"18\" x2=\"18\" y1=\"18\" y2=\"11\"/><polygon points=\"12 2 20 7 4 7\"/>", "laptop": "<path d=\"M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16\"/>"};
var EMOJI={"🏠": "home", "🏘": "home", "🏡": "home", "📢": "megaphone", "📣": "megaphone", "📅": "calendar-days", "🗓": "calendar-days", "📆": "calendar-days", "📝": "clipboard-list", "📋": "clipboard-list", "📞": "phone", "☎": "phone", "💬": "message-circle", "🗨": "message-circle", "🚨": "triangle-alert", "⚠": "triangle-alert", "💰": "wallet", "💳": "credit-card", "💵": "banknote", "💸": "banknote", "🪙": "coins", "🔒": "lock", "🔐": "lock", "🔑": "lock", "✅": "circle-check", "✔": "circle-check", "❌": "circle-x", "✖": "circle-x", "ℹ": "info", "📍": "map-pin", "🧳": "map-pin", "🕒": "clock", "⏰": "clock", "🕐": "clock", "⏳": "clock", "🕘": "clock", "🎉": "sparkles", "🎊": "sparkles", "✨": "sparkles", "👋": "sparkles", "🎪": "sparkles", "🧹": "sparkles", "🎁": "gift", "🏆": "trophy", "🗑": "trash-2", "✏": "pencil", "📥": "download", "⬇": "download", "📤": "upload", "⬆": "upload", "🖨": "printer", "🔄": "refresh-cw", "↩": "undo-2", "📷": "camera", "📸": "camera", "🖼": "images", "📰": "newspaper", "👥": "users", "👤": "user", "🛍": "shopping-bag", "🛒": "shopping-bag", "🏪": "store", "⚽": "activity", "📌": "pin", "🛡": "shield-check", "💡": "lightbulb", "🎯": "target", "🔍": "search", "📧": "mail", "✉": "mail", "🧾": "receipt", "📊": "bar-chart", "📈": "trending-up", "📉": "trending-down", "⭐": "star", "★": "star", "🔗": "link", "🔔": "bell", "⚡": "zap", "🔥": "zap", "🏥": "heart", "🙏": "heart", "❤": "heart", "🍜": "utensils", "🌳": "leaf", "📜": "file-text", "📄": "file-text", "📑": "file-text", "💧": "droplets", "🔧": "wrench", "🛠": "wrench", "📨": "send", "✈": "send", "📒": "file-text", "🤖": "bot", "✕": "x", "➕": "plus", "🔴": "dot:red", "🟢": "dot:green", "🔵": "dot:blue", "⚪": "dot:white", "📱": "smartphone", "📲": "smartphone", "🏟": "building", "💼": "briefcase", "🧪": "flask-conical", "🔓": "lock-open", "📵": "phone", "📦": "package", "♻": "refresh-cw", "🔁": "refresh-cw", "📎": "paperclip", "✍": "pencil", "➤": "send", "👇": "arrow-down", "🌿": "leaf", "🏦": "landmark", "❗": "circle-alert", "💻": "laptop", "👨": "user", "🚚": "truck", "🚒": "truck", "🚑": "truck", "🚗": "truck", "🍱": "utensils", "🧁": "utensils"};

/* ---------- sprite ---------- */
function mountSprite(){
  if(document.getElementById("sgSprite")) return;
  var s='<svg id="sgSprite" xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">';
  for(var k in ICONS) s+='<symbol id="i-'+k+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+ICONS[k]+'</symbol>';
  s+='</svg>';
  var d=document.createElement("div"); d.innerHTML=s; document.body.insertBefore(d.firstChild,document.body.firstChild);
}
function icon(name,cls){ return '<svg class="i'+(cls?' '+cls:'')+'" aria-hidden="true" focusable="false"><use href="#i-'+name+'"/></svg>'; }
window.SiagaIcon=icon;

/* ---------- emoji -> ikon ---------- */
var keys=Object.keys(EMOJI).sort(function(a,b){return b.length-a.length;});
var re=new RegExp("("+keys.map(function(k){return k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}).join("|")+")\\uFE0F?","g");
var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,OPTION:1,SELECT:1,TITLE:1,CANVAS:1,NOSCRIPT:1,SVG:1,CODE:1};
function skipNode(n){
  for(var p=n.parentNode;p&&p.nodeType===1;p=p.parentNode){
    if(SKIP[p.nodeName.toUpperCase()]) return true;
    if(p.hasAttribute&&(p.hasAttribute("data-keep-emoji")||p.classList.contains("chat-msgs")||p.classList.contains("msg"))) return true;
  }
  return false;
}
function convertText(t){
  if(!t.nodeValue||!re.test(t.nodeValue)){re.lastIndex=0;return;}
  re.lastIndex=0;
  if(skipNode(t)) return;
  var txt=t.nodeValue, frag=document.createDocumentFragment(), last=0, m;
  while((m=re.exec(txt))){
    if(m.index>last) frag.appendChild(document.createTextNode(txt.slice(last,m.index)));
    var sp=document.createElement("span"); sp.className="ico"; sp.setAttribute("aria-hidden","true");
    var nm=EMOJI[m[1]], col="";
    if(nm.indexOf(":")>-1){ col=nm.split(":")[1]; nm=nm.split(":")[0]; sp.className+=" ico-"+col; }
    sp.innerHTML=icon(nm); frag.appendChild(sp); last=re.lastIndex;
    /* hapus spasi sesudah ikon agar jarak diatur CSS */
    if(txt.charAt(last)===" ") last++;
  }
  re.lastIndex=0;
  if(last<txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
  t.parentNode.replaceChild(frag,t);
}
function walk(root){
  if(!root) return;
  if(root.nodeType===3){convertText(root);return;}
  if(root.nodeType!==1||SKIP[root.nodeName.toUpperCase()]) return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null), list=[], n;
  while((n=w.nextNode())) list.push(n);
  list.forEach(convertText);
}
var queued=[], raf=0;
function flush(){ raf=0; var q=queued; queued=[]; q.forEach(walk); }
function enqueue(n){ queued.push(n); if(!raf) raf=requestAnimationFrame(flush); }
function observe(){
  if(!window.MutationObserver) return;
  new MutationObserver(function(ms){
    ms.forEach(function(m){
      if(m.type==="characterData"){ if(m.target.parentNode&&!(m.target.parentNode.closest&&m.target.parentNode.closest(".ico"))) enqueue(m.target); }
      else m.addedNodes.forEach(function(n){ if(n.nodeType===3||n.nodeType===1) enqueue(n); });
    });
  }).observe(document.body,{childList:true,subtree:true,characterData:true});
}

/* ---------- shell: dropdown, drawer, sheet, search ---------- */
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}

function closeAll(except){
  $$(".sg-pop.open").forEach(function(p){ if(p!==except){ p.classList.remove("open"); var b=p.querySelector("[aria-expanded]"); if(b) b.setAttribute("aria-expanded","false"); } });
}
function bindPop(){
  $$(".sg-pop").forEach(function(p){
    var btn=p.querySelector("[data-pop-btn]"); if(!btn) return;
    btn.addEventListener("click",function(e){
      e.stopPropagation();
      var o=!p.classList.contains("open"); closeAll(p);
      p.classList.toggle("open",o); btn.setAttribute("aria-expanded",o?"true":"false");
    });
  });
  document.addEventListener("click",function(e){ if(!e.target.closest||!e.target.closest(".sg-pop")) closeAll(); });
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"){ closeAll(); closeLayer(); } });
}

var openLayerEl=null;
function openLayer(id,focusSel){
  var el=document.getElementById(id); if(!el) return;
  closeLayer(); closeAll();
  el.hidden=false; requestAnimationFrame(function(){ el.classList.add("open"); });
  document.documentElement.classList.add("sg-lock"); openLayerEl=el;
  var f=focusSel&&$(focusSel,el); if(f) setTimeout(function(){f.focus();},60);
}
function closeLayer(){
  if(!openLayerEl) return; var el=openLayerEl; openLayerEl=null;
  el.classList.remove("open"); document.documentElement.classList.remove("sg-lock");
  setTimeout(function(){ el.hidden=true; },220);
}
function bindLayers(){
  $$("[data-open]").forEach(function(b){
    b.addEventListener("click",function(e){ e.preventDefault(); openLayer(b.getAttribute("data-open"),b.getAttribute("data-focus")); });
  });
  $$("[data-close]").forEach(function(b){ b.addEventListener("click",closeLayer); });
  $$(".sg-layer a").forEach(function(a){ a.addEventListener("click",function(){ closeLayer(); }); });
}

var PAGES=[
 ["Beranda","index.html","home","portal utama beranda"],
 ["Informasi & Pengumuman","informasi.html","megaphone","info pengumuman berita warga"],
 ["Agenda Kegiatan","agenda.html","calendar-days","agenda jadwal kegiatan rapat kerja bakti"],
 ["Layanan Warga","layanan.html","users","layanan surat pengantar domisili ajukan"],
 ["Lapor & Pengaduan","layanan.html#lapor","triangle-alert","lapor pengaduan keluhan lampu jalan sampah drainase keamanan"],
 ["Transparansi Kas RT","transparansi.html","file-text","kas keuangan saldo pemasukan pengeluaran laporan"],
 ["UMKM Warga","umkm.html","store","umkm usaha jualan toko dagang"],
 ["Galeri Kegiatan","galeri.html","images","galeri foto dokumentasi"],
 ["Kontak Penting","kontak.html","phone","kontak telepon whatsapp pengurus ketua sekretaris bendahara keamanan"],
 ["Live Chat","livechat.html","message-circle","chat tanya asisten admin"],
 ["Berita Terkini","berita.html","newspaper","berita bekasi"],
 ["Bayar Iuran","bayar.html","credit-card","iuran bayar transfer bulanan"]
];
function bindSearch(){
  var inp=document.getElementById("sgSearchInput"), out=document.getElementById("sgSearchList"); if(!inp||!out) return;
  function render(q){
    q=(q||"").toLowerCase().trim();
    var rows=PAGES.filter(function(p){ return !q||(p[0]+" "+p[3]).toLowerCase().indexOf(q)>-1; });
    out.innerHTML=rows.length?rows.map(function(p){
      return '<li><a href="'+p[1]+'"><span class="sg-ic">'+icon(p[2])+'</span><span>'+p[0]+'</span>'+icon("chevron-right","sg-chev")+'</a></li>';
    }).join(""):'<li class="sg-empty">Tidak ada halaman yang cocok. Coba kata lain, misalnya &ldquo;kas&rdquo; atau &ldquo;lapor&rdquo;.</li>';
  }
  inp.addEventListener("input",function(){ render(inp.value); });
  inp.addEventListener("keydown",function(e){ if(e.key==="Enter"){ var a=out.querySelector("a"); if(a) location.href=a.getAttribute("href"); } });
  render("");
}

/* header: bayangan saat scroll */
function bindScroll(){
  var h=document.getElementById("sgHeader"); if(!h) return;
  function f(){ h.classList.toggle("scrolled",(window.pageYOffset||0)>8); }
  f(); window.addEventListener("scroll",f,{passive:true});
}

/* Grup WhatsApp: ikuti pola lama (RT_CONFIG.linkGrupWA, jika kosong -> kontak) */
function bindGrupWA(){
  $$("[data-grupwa]").forEach(function(g){
    var url=(window.RT_CONFIG&&RT_CONFIG.linkGrupWA)||"";
    if(url){ g.href=url; g.target="_blank"; g.rel="noopener"; } else { g.href="kontak.html"; g.removeAttribute("target"); }
  });
}

function init(){
  mountSprite(); walk(document.body); observe();
  bindPop(); bindLayers(); bindSearch(); bindScroll(); bindGrupWA();
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
