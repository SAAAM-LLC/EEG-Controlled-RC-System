/*
 * Arduino RC Controller for EEG Brain-Controlled System
 * 
 * This sketch receives commands from a computer running the EEG processing software
 * and controls motors/servos for an RC car, drone, or rocket.
 * 
 * Command format: "F100,R050,H075"
 * - F: Forward/backward (-100 to 100)
 * - R: Right/left (-100 to 100)
 * - H: Height for drones/rockets (0 to 100)
 */

#include <Servo.h>

// Pin definitions
#define MOTOR_ENABLE_PIN 9    // PWM pin for motor speed
#define MOTOR_DIR_PIN_A 7     // Direction control pin A
#define MOTOR_DIR_PIN_B 8     // Direction control pin B
#define STEERING_SERVO_PIN 10 // Servo control pin
#define HEIGHT_SERVO_PIN 11   // For drones/rockets - controls elevation

// Constants
#define MAX_COMMAND_LENGTH 20
#define MIN_PULSE_WIDTH 1000  // Servo min pulse width in microseconds
#define MAX_PULSE_WIDTH 2000  // Servo max pulse width in microseconds

// Variables
Servo steeringServo;
Servo heightServo;
char commandBuffer[MAX_COMMAND_LENGTH];
int commandIndex = 0;
int forwardValue = 0;    // -100 to 100
int rightValue = 0;      // -100 to 100
int heightValue = 0;     // 0 to 100
unsigned long lastCommandTime = 0;
const unsigned long COMMAND_TIMEOUT = 1000;  // Timeout in milliseconds

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  Serial.println("EEG RC Controller Ready");
  
  // Initialize motor control pins
  pinMode(MOTOR_ENABLE_PIN, OUTPUT);
  pinMode(MOTOR_DIR_PIN_A, OUTPUT);
  pinMode(MOTOR_DIR_PIN_B, OUTPUT);
  
  // Initialize servos
  steeringServo.attach(STEERING_SERVO_PIN, MIN_PULSE_WIDTH, MAX_PULSE_WIDTH);
  heightServo.attach(HEIGHT_SERVO_PIN, MIN_PULSE_WIDTH, MAX_PULSE_WIDTH);
  
  // Center servos and stop motors
  steeringServo.write(90);
  heightServo.write(0);
  stopMotors();
}

void loop() {
  // Check for incoming commands
  if (Serial.available() > 0) {
    char c = Serial.read();
    
    // Process character
    if (c == '\n') {
      // End of command - process it
      commandBuffer[commandIndex] = '\0';  // Null terminate
      processCommand(commandBuffer);
      commandIndex = 0;  // Reset buffer index
      lastCommandTime = millis();
    } else if (commandIndex < MAX_COMMAND_LENGTH - 1) {
      // Add character to buffer
      commandBuffer[commandIndex++] = c;
    }
  }
  
  // Check for command timeout (safety feature)
  if (millis() - lastCommandTime > COMMAND_TIMEOUT) {
    // No commands received for a while - stop for safety
    if (forwardValue != 0 || rightValue != 0 || heightValue != 0) {
      forwardValue = 0;
      rightValue = 0;
      // Don't reset height to allow for controlled descent
      updateControls();
      Serial.println("Control timeout - stopping");
    }
  }
}

void processCommand(const char* command) {
  // Parse the command string
  // Format: "F100,R050,H075"
  
  // Variables to store parsed values
  int newForward = forwardValue;
  int newRight = rightValue;
  int newHeight = heightValue;
  
  // Parse command
  char* ptr = (char*)command;
  while (*ptr) {
    char code = *ptr++;
    
    // Skip to value
    while (*ptr && !isDigit(*ptr) && *ptr != '-') ptr++;
    
    // Parse value
    if (*ptr) {
      int value = atoi(ptr);
      
      // Process based on code
      switch (code) {
        case 'F':  // Forward/backward
          newForward = constrain(value, -100, 100);
          break;
        case 'R':  // Right/left
          newRight = constrain(value, -100, 100);
          break;
        case 'H':  // Height
          newHeight = constrain(value, 0, 100);
          break;
      }
      
      // Skip to next code
      while (*ptr && *ptr != ',') ptr++;
      if (*ptr == ',') ptr++;
    }
  }
  
  // Update control values if changed
  if (newForward != forwardValue || newRight != rightValue || newHeight != heightValue) {
    forwardValue = newForward;
    rightValue = newRight;
    heightValue = newHeight;
    updateControls();
    
    // Send acknowledgement
    Serial.print("ACK:");
    Serial.print(forwardValue);
    Serial.print(",");
    Serial.print(rightValue);
    Serial.print(",");
    Serial.println(heightValue);
  }
}

void updateControls() {
  // Update motor direction and speed
  if (forwardValue > 0) {
    // Forward
    digitalWrite(MOTOR_DIR_PIN_A, HIGH);
    digitalWrite(MOTOR_DIR_PIN_B, LOW);
    analogWrite(MOTOR_ENABLE_PIN, map(forwardValue, 0, 100, 0, 255));
  } else if (forwardValue < 0) {
    // Backward
    digitalWrite(MOTOR_DIR_PIN_A, LOW);
    digitalWrite(MOTOR_DIR_PIN_B, HIGH);
    analogWrite(MOTOR_ENABLE_PIN, map(-forwardValue, 0, 100, 0, 255));
  } else {
    // Stop
    stopMotors();
  }
  
  // Update steering servo
  // Map from -100,100 to 45,135 (90 is center)
  int steeringAngle = map(rightValue, -100, 100, 45, 135);
  steeringServo.write(steeringAngle);
  
  // Update height servo (for drones/rockets)
  // Map from 0,100 to 0,180
  int heightAngle = map(heightValue, 0, 100, 0, 180);
  heightServo.write(heightAngle);
}

void stopMotors() {
  // Stop motors by disabling motor driver
  digitalWrite(MOTOR_DIR_PIN_A, LOW);
  digitalWrite(MOTOR_DIR_PIN_B, LOW);
  analogWrite(MOTOR_ENABLE_PIN, 0);
}
