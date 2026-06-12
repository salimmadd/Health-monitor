#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define DHTPIN 15
#define DHTTYPE DHT22

#define POT1 34
#define POT2 35
#define POT3 32

#define BUZZER 4
#define LED 2

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
DHT dht(DHTPIN, DHTTYPE);

// WiFi credentials (Wokwi network)
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// ThingSpeak
const char* writeAPIKey = "4ZH7N92NX20LDZ2R";

unsigned long lastUpload = 0;

// Health parameters
int heartRateBPM;
int spo2Level;
int bloodPressureSystolic;

float temp, hum;

void setup() {
  Serial.begin(115200);

  pinMode(LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  dht.begin();

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED Failed");
    while (true);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);

  // WiFi connect
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected");
  Serial.println("System Started");
}

void loop() {

  // Read potentiometers
  int pot1 = analogRead(POT1);
  int pot2 = analogRead(POT2);
  int pot3 = analogRead(POT3);

  heartRateBPM = map(pot1, 0, 4095, 40, 180);
  spo2Level = map(pot2, 0, 4095, 85, 100);
  bloodPressureSystolic = map(pot3, 0, 4095, 90, 150);

  // DHT readings
  temp = dht.readTemperature();
  hum = dht.readHumidity();

  if (isnan(temp) || isnan(hum)) {
    Serial.println("DHT read failed");
    return;
  }

  // Serial log
  Serial.println("---- HEALTH DATA ----");
  Serial.print("HR: "); Serial.println(heartRateBPM);
  Serial.print("SpO2: "); Serial.println(spo2Level);
  Serial.print("BP Systolic: "); Serial.println(bloodPressureSystolic);
  Serial.print("Temp: "); Serial.println(temp);
  Serial.print("Humidity: "); Serial.println(hum);

  // OLED display
  display.clearDisplay();

  display.setCursor(0, 0);
  display.print("HR: "); display.print(heartRateBPM); display.println(" BPM");

  display.print("SpO2: "); display.print(spo2Level); display.println("%");

  display.print("BP: "); display.print(bloodPressureSystolic); display.println(" mmHg");

  display.print("T: "); display.print(temp); display.println(" C");

  display.print("H: "); display.print(hum); display.println("%");

  display.display();

  // Alarm logic
  bool criticalCondition =
      (bloodPressureSystolic > 140) ||
      (heartRateBPM > 140) ||
      (spo2Level < 92);

  if (criticalCondition) {
    digitalWrite(LED, HIGH);
    tone(BUZZER, 1200);
  } else {
    digitalWrite(LED, LOW);
    noTone(BUZZER);
  }

  // ThingSpeak HTTP upload (every 20s)
  if (millis() - lastUpload > 20000) {

    if (WiFi.status() == WL_CONNECTED) {

      HTTPClient http;

      String url = "https://api.thingspeak.com/update?api_key=";
      url += writeAPIKey;
      url += "&field1=" + String(heartRateBPM);          // Heart Rate
      url += "&field2=" + String(spo2Level);            // SpO2
      url += "&field3=" + String(temp);                 // Temperature
      url += "&field4=" + String(hum);                  // Humidity
      url += "&field5=" + String(bloodPressureSystolic); // Blood Pressure Systolic

      http.begin(url);

      int httpCode = http.GET();

      if (httpCode > 0) {
        Serial.print("ThingSpeak response: ");
        Serial.println(httpCode);
      } else {
        Serial.print("Error uploading to ThingSpeak: ");
        Serial.println(http.errorToString(httpCode));
      }

      http.end();
    } else {
      Serial.println("WiFi disconnected. Attempting to reconnect...");
      WiFi.reconnect();
    }

    lastUpload = millis();
  }

  delay(1000);
}