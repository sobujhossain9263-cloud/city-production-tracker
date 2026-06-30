# City Production Tracker — সেটআপ গাইড

## ফাইল
- `index.html` — মূল ওয়েবসাইট
- `app.js` — লজিক + Firebase সংযোগ
- `database.rules.json` — Firebase সিকিউরিটি রুলস

## লগইন তথ্য
- **Admin:** ID `admin`, Password `sobuj7097`
- **User:** ID `1` থেকে `17`, সবার Password `city2026`
  (চাইলে app.js এর `USER_PASSWORD` লাইনে গিয়ে পাসওয়ার্ড পরিবর্তন করা যাবে)

## GitHub এ আপলোড করার ধাপ
1. GitHub এ নতুন একটা রিপোজিটরি বানাও — নাম দাও `city-production-tracker`
2. `index.html` এবং `app.js` ফাইল দুইটা আপলোড করো (root এ, কোনো ফোল্ডারে না)
3. রিপো Settings → Pages এ গিয়ে Source হিসেবে `main` ব্রাঞ্চ সিলেক্ট করে Save করো
4. কিছুক্ষণ পর লিংক একটিভ হবে: `https://sobujhossain9263-cloud.github.io/city-production-tracker/`

## Firebase Database Rules সেট করা (গুরুত্বপূর্ণ — ৩০ দিন পর Test Mode বন্ধ হয়ে যাবে)
1. Firebase Console এ যাও → Realtime Database → Rules ট্যাব
2. বর্তমান রুলস মুছে `database.rules.json` ফাইলের কন্টেন্ট পেস্ট করো
3. "Publish" এ ক্লিক করো

এই রুলস দিয়ে যে কেউ ডাটা পড়তে/লিখতে পারবে (যেহেতু লগইন সিস্টেমটা অ্যাপের ভেতরেই চেক হয়, Firebase Auth ব্যবহার হয়নি)। এটা পরিবারিক/অফিস ব্যবহারের জন্য যথেষ্ট, তবে ভবিষ্যতে আরো সিকিউর করতে চাইলে Firebase Authentication যোগ করা যাবে — তখন জানিও।

## ফ্লেভারের নাম বসানো
লগইন করো Admin দিয়ে → বাম মেনু থেকে লাইন সিলেক্ট করো → Flavor 1, Flavor 2... এ ক্লিক করো → উপরে নাম লেখার ঘরে আসল ফ্লেভারের নাম লিখে দাও → বাকি ফিল্ড পূরণ করে Save Data চাপো।
