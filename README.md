UPPet is a mobile application used for peer-to-peer pet adoption. Specifically, Uppet will be used in the locality of Batong Malake, Los Banos, Laguna.


How to install the application
- First clone the repository

``
- cd SP2_uppet_mobile_app/backend
- npm i || npm install
``
``
- cd SP2_uppet_mobile_app/frontend/uppet
- npm i || npm install
``

How to run
``
to run the backend server

if inside the backend directory run either one of the commands
- npm run dev
- npm run 
- npm start

to run the app for UPPET you need the eas build but IF you dont have it run this command
-eas build --platform android
after it is done building scan the QR code given using expo go to download the apk and then install it

if you have successfully downloaded eas build / apk of the uppet just run
- npx expo start --clear

this ensures the cache is clear and then scan the QR Code on the UPPET App on your mobile device
``
