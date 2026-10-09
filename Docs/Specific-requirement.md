# Dot: Requirements Document

**Version:** v.1.0(beta) | **Date:** October 2026
**Related document:** [Project Overview](project-overview.md)

---

## 1. Introduction

### 1.1 Purpose

This document defines what Dot must do. It is written for developers, designers and testers, and it is the reference for building and checking the app. For the reasoning behind these requirements, see the [Project Overview](./project-overview.md).

### 1.2 Scope

Dot is a shared habit and routine tracker for two connected people. This document covers the mobile app, the backend API and the data they use.

**In scope for v.1.0(beta)**

- Accounts, partner connection, habits, alarms, check-in, timer, early exit, shared timeline

**Planned after the MVP (included here and marked "Later")**

- Missed habit handling, schedule-change notifications, motivation stickers, progress tracking

**Out of scope**

- More than two users in one connection
- Group challenges, leaderboards or competitive features
- Automatic check-in (GPS, sensors, wearables)
- A full web version

### 1.3 How to read this document

- Requirements use the form "The system shall…" and have a unique ID.
- **Priority:** *MVP* means required for the first release. *Later* means planned after.
- Items marked **[A#]** rely on an assumption listed in [Section 12](#12-assumptions-and-open-questions). Please confirm or correct them.
- Terms are defined in the glossary of the [Project Overview](project-overview.md#14-glossary).

---

## 2. Overall Description

### 2.1 Product perspective

Dot is a new, standalone product made of three parts:

```
 Mobile app (React Native / Expo)  <-->  REST API (Node.js, Express)  <-->  MongoDB
        |
        +-- Local alarms and timer run on the device
```

### 2.2 User roles

| Role | Description | Permissions |
| --- | --- | --- |
| **User** | A person with a Dot account. | Manage own profile, habits and timeline entries. |
| **Partner** | The one other user connected to a given user. | View the user's timeline (read-only). Cannot edit the user's data. |

There is no admin role in v.1.0(beta).

### 2.3 Operating environment

- Android. Minimum OS versions are to be decided (**[Q16](#12-assumptions-and-open-questions)**).
- Internet connection needed for account actions, partner connection and timeline sharing.
- Alarms and the countdown timer must work without a connection.

### 2.4 Constraints

- The app is built with JavaScript (React Native with Expo) and a Node.js, Express and MongoDB backend.
- Development testing uses Expo Go. A development build may be required if alarm behavior needs native code.
- Check-in is manual by design.

### 2.5 Design guidance

Visual style and tone are defined in the [Project Overview](./project-overview.md#9-design-direction). All user-facing text shall be warm and supportive, never shaming.

---

## 3. Functional Requirements

### 3.1 Accounts and authentication (AUTH)

| ID | Requirement | Priority |
| --- | --- |----------|
| AUTH-01 | The system shall let a new user create an account with a display name, email address and password **[A1]**. | MVP      |
| AUTH-02 | The system shall validate that the email is well formed and not already registered, and that the password meets a minimum length of 8 characters. | MVP      |
| AUTH-03 | The system shall let a registered user log in with email and password. | MVP      |
| AUTH-04 | The system shall keep the user signed in on the device until they log out. | MVP      |
| AUTH-05 | The system shall let a user log out. | MVP      |
| AUTH-06 | The system shall let a user reset a forgotten password through their email. | Later    |
| AUTH-07 | The system shall store each user's time zone, taken from the device, and update it when the device time zone changes **[A9]**. | Later    |

### 3.2 Partner connection (PTN)

| ID | Requirement                                                                                                                   | Priority |
| --- |-------------------------------------------------------------------------------------------------------------------------------| --- |
| PTN-01 | The system shall give every user a unique, shareable invite code **[A2]**.                                                    | MVP |
| PTN-02 | The system shall let a user copy or share their invite code from the app.                                                     | MVP |
| PTN-03 | The system shall let a user enter another user's invite code to request a connection.                                         | MVP |
| PTN-04 | The system shall activate the connection  after the code successfully accepted **[A3]**.                                      | MVP |
| PTN-05 | The system shall allow each user to have at most one active partner at a time.                                                | MVP |
| PTN-06 | The system shall reject a request if either user already has an active partner, and shall explain why in a friendly message.  | MVP |
| PTN-07 | The system shall reject a user's own invite code.                                                                             | MVP |
| PTN-08 | The system shall show a user with no partner the "Connect partner" screen as the main next step.                              | MVP |
| PTN-09 | The system shall show the partner's name on the Home screen once connected.                                                   | MVP |
| PTN-11 | The system shall limit repeated failed invite code attempts to prevent guessing.                                              | MVP |

### 3.3 Habit management (HAB)

| ID | Requirement                                                                                                                                                   | Priority |
| --- |---------------------------------------------------------------------------------------------------------------------------------------------------------------| --- |
| HAB-01 | The system shall let a user create a habit with a name (1 to 10 characters).                                                                                  | MVP |
| HAB-02 | The system shall let a user choose an icon and a tile color for each habit.                                                                                   | MVP |
| HAB-03 | The system shall let a user set a duration in hours and minutes (minimum 1 minute, maximum 12 hours) for each habit.                                          | MVP |
| HAB-05 | The system shall let a user choose when a habit repeats: one time only, every day, or selected weekdays.                                                      | MVP |
| HAB-06 | The system shall let a user turn the alarm on or off for each habit.                                                                                          | MVP |
| HAB-07 | The system shall let a user delete their habit.                                                                                                               | MVP |
| HAB-09 | The system shall create a timeline entry for each occurrence of a habit on its scheduled days.                                                                | MVP |
| HAB-10 | The system shall treat each habit as belonging to one user. Whether a habit can be shared jointly is undecided (**[Q5](#12-assumptions-and-open-questions)**). | MVP |

### 3.4 Alarms (ALM)

| ID | Requirement                                                                                                               | Priority |
| --- |---------------------------------------------------------------------------------------------------------------------------| --- |
| ALM-01 | The system shall ring an alarm on the user's device at the scheduled start time of each habit that has its alarm on.      | MVP |
| ALM-02 | The alarm shall work when the app is closed and the phone is locked.                                                      | MVP |
| ALM-03 | The alarm shall work without an internet connection.                                                                      | MVP |
| ALM-04 | The alarm shall show the habit name and let the user open the app directly to check in.                                   | MVP |
| ALM-05 | The system shall let the user dismiss the alarm.                                                                          | MVP |
| ALM-06 | The system shall reschedule or cancel alarms whenever the user edits or deletes a habit, or changes the device time zone. | MVP |
| ALM-07 | The system shall ring alarms only on the device of the habit's owner, never on the partner's device.                      | MVP |
| ALM-08 | The system shall ask the user for notification permission the first time they enable an alarm, and explain why.           | MVP |
| ALM-09 | The system shall let the user snooze an alarm **[Q9](#12-assumptions-and-open-questions)**.                               | Later |

### 3.5 Check-in and timer (CHK)

| ID | Requirement                                                                                                                                                     | Priority |
| --- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------| --- |
| CHK-01 | The system shall let a user tap a check-in button (for example "I'm at the gym") on a habit entry scheduled for today.                                          | MVP |
| CHK-02 | The system shall record the actual start time as the exact time of the tap, not the scheduled time.                                                             | MVP |
| CHK-03 | The system shall allow check-in with in 30 min at scheduled and 30min prior **[A5]**.                                                                           | MVP |
| CHK-04 | On check-in, the system shall start a countdown timer equal to the habit's duration.                                                                            | MVP |
| CHK-05 | The timer shall display remaining time in hours, minutes and seconds.                                                                                           | MVP |
| CHK-06 | The timer shall continue to run, and show the correct remaining time, when the app is in the background or the screen is locked.                                | MVP |
| CHK-07 | The system shall calculate remaining time from the stored start time rather than by counting in the app.                                                        | MVP |
| CHK-08 | When the timer reaches zero then mark task as *Completed*.                                                                                                      | MVP |
| CHK-09 | The system shall record time spent as actual end time minus actual start time.                                                                                  | MVP |
| CHK-10 | The system shall allow only one habit to be *In progress* at a time **[A6]**.                                                                                   | MVP |
| CHK-11 | The system shall keep an in-progress timer correct if the app is restarted.                                                                                     | MVP |

### 3.6 Early exit (EXT)

| ID | Requirement                                                                                    | Priority |
| --- |------------------------------------------------------------------------------------------------| --- |
| EXT-01 | While a timer is running, the system shall offer a "Leave early" action.                       | MVP |
| EXT-02 | The system shall require a reason (1 to 100 characters) before saving an early exit.           | MVP |
| EXT-03 | The system shall record the actual end time and time spent, and set the entry to *Left early*. | MVP |
| EXT-04 | The system shall show the partner the time spent and the reason(if pattner leave earlyer).     | MVP |

### 3.7 Missed habits (MIS)

| ID | Requirement                                                                                                                           | Priority |
| --- |---------------------------------------------------------------------------------------------------------------------------------------| --- |
| MIS-01 | The system shall mark an entry as *Missed* when it meets the rule in BR-10 **[A7]**.                                                  | Later |
| MIS-02 | The system shall let the user add an explanation (1 to 100 characters) to a missed entry.                                             | Later |
| MIS-03 | The system shall let the user reschedule a missed entry to another time and explanation of rescheduling.                              | Later |
| MIS-04 | On rescheduling, the system shall keep the original entry as *Missed* with a link to the new entry, and create a new *Planned* entry. | Later |
| MIS-05 | The system shall show the partner the missed status, the explanation, and any new time.                                               | Later |
| MIS-06 | The system shall prompt the user, in a supportive tone, to explain or reschedule a missed habit.                                      | Later |

### 3.8 Shared timeline (TML)

| ID | Requirement | Priority |
| --- | --- | --- |
| TML-01 | The system shall show a user their habit entries for a chosen day on the Home screen. | MVP |
| TML-02 | The system shall provide a week strip to choose a day, with today highlighted and past days viewable. | MVP |
| TML-03 | The system shall let a user switch between their own timeline and their partner's. | MVP |
| TML-04 | The partner's timeline shall be read-only. | MVP |
| TML-05 | Each entry shall show the habit name, icon, planned start time and current status. | MVP |
| TML-06 | When an entry has been checked in, it shall also show the actual start time and, once finished, the time spent. | MVP |
| TML-07 | Between the planned start time and check-in, the entry shall show a "Not started yet" status to the partner. | MVP |
| TML-08 | While an entry is in progress, the partner shall see it as in progress with the actual start time. | MVP |
| TML-09 | Changes shall appear on the partner's device within 5 seconds when both are online (see NFR-PERF-02). | MVP |
| TML-10 | The system shall provide an entry detail view showing planned versus actual times, time spent and any reason. | MVP |
| TML-11 | The owner shall be able to edit actual start time, actual end time and reason on their own entries. | MVP |
| TML-12 | The system shall mark an entry as "edited" and show this to the partner **[A8]**. | MVP |
| TML-13 | The system shall show an empty state with a friendly message when a day has no entries. | MVP |

### 3.9 Notifications (NTF)(V.0.2)(later)

| ID | Requirement | Priority |
| --- | --- | --- |
| NTF-01 | The system shall notify a partner when a user changes a habit's time, duration or repeat days, or adds or deletes a habit. | Later |
| NTF-02 | The notification shall say what changed, for example "Aman moved Gym from 7:00 to 8:00." | Later |
| NTF-03 | The system shall send push notifications to the partner's device when the app is closed. | Later |
| NTF-04 | The system shall let a user turn each notification type on or off. | Later |
| NTF-05 | Whether the partner is also notified on check-in, completion or a miss is undecided (**[Q10](#12-assumptions-and-open-questions)**). | Later |

### 3.10 Encouragement (ENC)

| ID | Requirement | Priority |
| --- | --- | --- |
| ENC-01 | The system shall let a user send a motivation sticker to their partner. | Later |
| ENC-02 | The system shall provide a fixed set of stickers to choose from. | Later |
| ENC-03 | The partner shall receive the sticker as a notification and see it on the related entry or Home screen. | Later |
| ENC-04 | Further encouragement features shall be specified before they are built. | Later |

### 3.11 Progress tracking (PRG)

| ID | Requirement | Priority |
| --- | --- | --- |
| PRG-01 | The system shall show a user how many entries were completed, left early and missed per day and per week. | Later |
| PRG-02 | The system shall show the same summary for the partner. | Later |
| PRG-03 | Progress views shall use encouraging wording and shall not rank partners against each other. | Later |

### 3.12 Profile and settings (PRF)

| ID | Requirement | Priority |
| --- | --- | --- |
| PRF-01 | The system shall let a user view and edit their display name. | MVP |
| PRF-02 | The system shall show the connected partner's name on the profile screen. | MVP |
| PRF-03 | The system shall let a user log out from the profile screen. | MVP |
| PRF-04 | The system shall let a user add a profile photo. | Later |
| PRF-05 | The system shall let a user delete their account and all associated data. | Later |

---

## 4. Habit Entry Status Model

A **habit entry** is one occurrence of a habit on one day.

| Status | Meaning | Stage |
| --- | --- | --- |
| Planned | Scheduled for later today or a future day. | MVP |
| Not started yet | Planned time has passed and the user has not checked in. | MVP |
| In progress | User checked in and the timer is running. | MVP |
| Completed | Timer reached zero. | MVP |
| Left early | User ended the entry before the timer finished, with a reason. | MVP |
| Missed | Not done in its window (see BR-10). | Later |
| Rescheduled | Missed entry moved to another time. | Later |

**Allowed transitions**

| From | To | Trigger |
| --- | --- | --- |
| Planned | Not started yet | Planned start time passes. |
| Planned / Not started yet | In progress | User checks in. |
| In progress | Completed | Timer reaches zero. |
| In progress | Left early | User chooses "Leave early" and gives a reason. |
| Not started yet | Missed | Rule in BR-10 is met. *(Later)* |
| Missed | Rescheduled | User reschedules. *(Later)* |

---

## 5. Business Rules

| ID | Rule |
| --- | --- |
| BR-01 | A user can have at most one active partner. |
| BR-02 | A user's habits and timeline are visible only to their connected partner. |
| BR-03 | Only the owner can create, edit or delete their own habits and entries. A partner has read-only access. |
| BR-04 | The timeline shows the actual start time. The planned time is kept for reference and shown in the detail view. |
| BR-05 | A reason is mandatory for every early exit. |
| BR-06 | Time spent equals actual end time minus actual start time. |
| BR-07 | Habit duration is chosen by the user. There are no fixed or required durations. |
| BR-08 | Alarms ring only on the owner's device. |
| BR-09 | Only one entry can be in progress per user at a time. |
| BR-10 | *(Proposed, Later.)* An entry becomes *Missed* when its planned window (planned start plus duration) has fully passed and the user never checked in. |
| BR-11 | Rescheduling keeps the original entry and links it to the new one. Nothing is overwritten. |
| BR-12 | Editing or deleting a habit never changes past entries. |
| BR-13 | Edited entries are marked as edited to the partner. |
| BR-14 | All timestamps are stored in UTC and shown in each viewer's local time zone **[A9]**. |
| BR-15 | When the connection ends, neither user can see the other's data (see **Q12** for what is kept). |
| BR-16 | All user-facing messages shall be encouraging and non-judgmental. |

---

## 6. User Stories and Acceptance Criteria

| ID | User story | Acceptance criteria | Related | Stage |
| --- | --- | --- | --- | --- |
| US-01 | As a user, I want to create an account so I can use Dot. | **Given** I am on Sign up, **when** I enter a valid name, email and password, **then** my account is created and I am taken to Connect partner. | AUTH-01 to 05 | MVP |
| US-02 | As a user, I want to connect with my partner so we can share timelines. | **Given** I have an invite code and my partner has none connected, **when** my partner enters my code and I accept, **then** we are connected and each sees the other's name on Home. | PTN-01 to 09 | MVP |
| US-03 | As a user, I want to be blocked from a second partner. | **Given** I already have a partner, **when** another user enters my code, **then** the request is rejected with a friendly message. | PTN-05, PTN-06 | MVP |
| US-04 | As a user, I want to create a habit with an alarm. | **Given** I am on Add habit, **when** I enter "Gym", 7:00 AM, 1h 30m, Mon to Fri, alarm on, and save, **then** the habit appears on my timeline on those days and an alarm is scheduled. | HAB-01 to 09, ALM-01 | MVP |
| US-05 | As a user, I want the alarm to ring even if my phone is locked. | **Given** the alarm is on and the phone is locked and offline, **when** 7:00 AM arrives, **then** the alarm rings and shows "Gym". | ALM-01 to 04 | MVP |
| US-06 | As a user, I want my real start time recorded. | **Given** Gym is planned for 7:00, **when** I tap "I'm at the gym" at 7:25, **then** my timeline shows a start time of 7:25 and my partner sees "At the gym since 7:25". | CHK-01, 02, TML-06 | MVP |
| US-07 | As a partner, I want to see that someone has not started yet. | **Given** Gym is planned for 7:00 and it is 7:10 with no check-in, **when** I view my partner's timeline, **then** the Gym entry shows "Not started yet". | TML-07 | MVP |
| US-08 | As a user, I want a timer that keeps running. | **Given** I checked in with a 1h 30m habit, **when** I lock my phone and reopen the app after 30 minutes, **then** the timer shows about 1h 00m remaining. | CHK-04 to 07, 11 | MVP |
| US-09 | As a user, I want to complete my habit. | **Given** a running timer, **when** it reaches zero, **then** I am notified, the entry becomes *Completed*, and my partner sees "Completed" with 1h 30m. | CHK-08, 09 | MVP |
| US-10 | As a user, I want to leave early and say why. | **Given** a running timer, **when** I tap "Leave early" and enter a reason, **then** the entry becomes *Left early*, and my partner sees the time spent and my reason. | EXT-01 to 04 | MVP |
| US-11 | As a user, I must not be able to leave early without a reason. | **Given** I tap "Leave early", **when** the reason field is empty and I try to save, **then** saving is blocked with a friendly prompt. | EXT-02, BR-05 | MVP |
| US-12 | As a user, I want to correct a timeline entry. | **Given** an entry with a wrong time, **when** I edit the start time and save, **then** the entry updates and my partner sees it marked "edited". | TML-11, 12 | MVP |
| US-13 | As a partner, I want to view but not change my partner's timeline. | **Given** I am viewing my partner's timeline, **when** I tap an entry, **then** I can see details but no edit controls. | TML-04, BR-03 | MVP |
| US-14 | As a user, I want to explain or reschedule a missed habit. | **Given** an entry is *Missed*, **when** I choose "Reschedule" and pick a new time, **then** the original stays *Missed*, a new *Planned* entry is created, and my partner sees both. | MIS-01 to 05 | Later |
| US-15 | As a partner, I want to know when a schedule changes. | **Given** my partner moves Gym from 7:00 to 8:00, **when** the change is saved, **then** I receive a notification describing the change. | NTF-01 to 03 | Later |
| US-16 | As a partner, I want to send encouragement. | **Given** I am viewing my partner's timeline, **when** I send a sticker, **then** my partner receives it as a notification and sees it in the app. | ENC-01 to 03 | Later |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement |
| --- | --- |
| NFR-PERF-01 | Main screens shall load within 2 seconds on a typical mobile connection. |
| NFR-PERF-02 | A change made by one partner shall appear on the other partner's device within 5 seconds when both are online. **[A10]** |
| NFR-PERF-03 | The timer display shall update every second without visible lag. |

### 7.2 Reliability

| ID | Requirement |
| --- | --- |
| NFR-REL-01 | Alarms shall ring within 30 seconds of the scheduled time on supported devices with notifications permitted. |
| NFR-REL-02 | Alarms and timers shall work offline. |
| NFR-REL-03 | The timer shall not drift: remaining time is always derived from the stored start time. |
| NFR-REL-04 | The app shall show a clear, friendly message when it is offline or a request fails, and shall not lose entered data. |
| NFR-REL-05 | The app shall guide users to phone settings (battery optimization, silent mode, Do Not Disturb) that can block alarms. |

### 7.3 Security

| ID | Requirement |
| --- | --- |
| NFR-SEC-01 | All communication between the app and the server shall use HTTPS. |
| NFR-SEC-02 | Passwords shall be stored only as salted hashes (for example bcrypt). |
| NFR-SEC-03 | The API shall authenticate requests with expiring tokens. |
| NFR-SEC-04 | The server shall check on every request that the caller may access the data (BR-02, BR-03). |
| NFR-SEC-05 | The API shall validate and sanitize all input. |
| NFR-SEC-06 | Login and invite-code attempts shall be rate-limited. |
| NFR-SEC-07 | Secrets and keys shall be kept in environment variables and never committed to version control. |

### 7.4 Privacy

| ID | Requirement |
| --- | --- |
| NFR-PRV-01 | Only the connected partner can see a user's data. |
| NFR-PRV-02 | Users shall be able to delete their account and data (PRF-05). |
| NFR-PRV-03 | The app shall collect only the data needed to work. |
| NFR-PRV-04 | A privacy policy and terms of use shall be available in the app before public release, in line with applicable data protection laws. |

### 7.5 Usability and accessibility

| ID | Requirement |
| --- | --- |
| NFR-USE-01 | Core actions (check in, finish, leave early) shall take no more than two taps from the Home screen. |
| NFR-USE-02 | Tap targets shall be at least 44 by 44 points. |
| NFR-USE-03 | Text shall meet WCAG AA contrast and support the phone's larger font settings. |
| NFR-USE-04 | Status shall never be shown by color alone; each status also has a label or icon. |
| NFR-USE-05 | Wording shall follow BR-16: warm, supportive and never shaming. |
| NFR-USE-06 | The app shall be usable one-handed on a standard phone. |

### 7.6 Compatibility

| ID | Requirement |
| --- | --- |
| NFR-CMP-01 | The app shall run on current versions of Android and iOS (minimums to be set, **Q16**). |
| NFR-CMP-02 | The app shall run in Expo Go during development. |
| NFR-CMP-03 | The layout shall adapt to different phone screen sizes. |

### 7.7 Maintainability and scalability

| ID | Requirement |
| --- | --- |
| NFR-MNT-01 | Code shall be modular, with data access isolated so mock data can be replaced by API calls. |
| NFR-MNT-02 | Reusable UI components shall be used consistently (tiles, status chips, buttons, sheets). |
| NFR-MNT-03 | The backend shall be stateless so it can scale horizontally later. |
| NFR-MNT-04 | Key logic (status transitions, time spent, missed rule) shall have automated tests. |

---

## 8. Data Requirements

The main entities, using MongoDB collections. Field names are proposed.

### 8.1 User

| Field | Type | Notes |
| --- | --- | --- |
| id | ObjectId | Primary key |
| name | String | Display name |
| email | String | Unique |
| passwordHash | String | Never returned by the API |
| inviteCode | String | Unique, shareable |
| timezone | String | For example `Asia/Kolkata` |
| photoUrl | String | *(Later)* |
| createdAt | Date | |

### 8.2 PartnerLink

| Field | Type | Notes |
| --- | --- | --- |
| id | ObjectId | |
| requesterId | ObjectId | User who entered the code |
| accepterId | ObjectId | User who owns the code |
| status | String | `pending`, `active`, `ended` |
| createdAt, endedAt | Date | |

### 8.3 Habit

| Field | Type | Notes |
| --- | --- | --- |
| id | ObjectId | |
| ownerId | ObjectId | |
| name | String | 1 to 40 characters |
| icon, color | String | Chosen by the user |
| startTime | String | Local time `HH:mm` |
| durationMinutes | Number | 1 to 720 |
| repeat | Object | `{ type: once / daily / weekdays, days: [0..6], date }` |
| alarmEnabled | Boolean | |
| createdAt, updatedAt, deletedAt | Date | `deletedAt` for soft delete |

### 8.4 HabitEntry (one occurrence of a habit on one day)

| Field | Type | Notes |
| --- | --- | --- |
| id | ObjectId | |
| habitId, ownerId | ObjectId | |
| date | String | `YYYY-MM-DD` in the owner's time zone |
| habitName, icon, color | String | Copied from the habit so history is stable |
| plannedStart | Date (UTC) | |
| plannedDurationMinutes | Number | |
| status | String | See [Section 4](#4-habit-entry-status-model) |
| actualStart, actualEnd | Date (UTC) | Null until set |
| timeSpentMinutes | Number | Derived from actual times |
| earlyExitReason | String | Required when status is `left_early` |
| missedExplanation | String | *(Later)* |
| rescheduledToEntryId | ObjectId | *(Later)* |
| edited | Boolean | True after a manual edit |
| createdAt, updatedAt | Date | |

### 8.5 Later entities

| Entity | Purpose | Key fields |
| --- | --- | --- |
| Sticker | Motivation stickers | senderId, receiverId, stickerType, entryId (optional), createdAt |
| Notification | In-app notification history | userId, type, payload, readAt, createdAt |
| DeviceToken | Push delivery | userId, token, platform |

### 8.6 Data retention

- Habit entries are kept after a habit is deleted or edited (BR-12).
- Deleting an account removes the user's data (PRF-05).
- What remains after a partnership ends is undecided (**Q12**).

---

## 9. Screens and Flows

### 9.1 Screen list

| ID | Screen | Purpose | Main requirements | Stage |
| --- | --- | --- | --- | --- |
| S1 | Welcome | Introduce Dot; entry to sign up or log in. | AUTH-01, AUTH-03 | MVP |
| S2 | Sign up | Create an account. | AUTH-01, 02 | MVP |
| S3 | Log in | Sign in. | AUTH-03, 04 | MVP |
| S4 | Connect partner | Show invite code, enter partner's code, accept requests. | PTN-01 to 08 | MVP |
| S5 | Home / Today | Day timeline, week strip, Me/Partner toggle, habit tiles. | TML-01 to 08, 13 | MVP |
| S6 | Add / Edit habit | Create or change a habit. | HAB-01 to 08 | MVP |
| S7 | Active timer | Countdown, partner status, Finish and Leave early. | CHK-04 to 09, EXT-01 | MVP |
| S8 | Leave early sheet | Enter the required reason. | EXT-02 to 05 | MVP |
| S9 | Entry detail | Planned vs actual times, time spent, reason, edit. | TML-10 to 12 | MVP |
| S10 | Alarm | Alarm notification that opens check-in. | ALM-01 to 05 | MVP |
| S11 | Profile | Name, partner, log out. | PRF-01 to 03 | MVP |
| S12 | Missed sheet | Add explanation or reschedule. | MIS-02 to 06 | Later |
| S13 | Notifications | Schedule changes and stickers. | NTF-01 to 04, ENC-03 | Later |
| S14 | Progress | Completed vs missed summaries. | PRG-01 to 03 | Later |
| S15 | Send encouragement | Pick and send a sticker. | ENC-01, 02 | Later |

### 9.2 Main flow

```
Welcome -> Sign up / Log in -> Connect partner -> Home / Today
                                                    |
              +-------------------------------------+-----------------+
              |                    |                |                 |
        Add habit (S6)      Partner toggle     Entry detail (S9)   Profile (S11)
              |             (read-only)
              v
        Alarm rings (S10) -> Check in -> Active timer (S7)
                                             |
                          +------------------+------------------+
                          v                                     v
                  Timer reaches zero                     Leave early (S8)
                    -> Completed                          -> Left early + reason
```

---

## 10. API Overview

*Proposed for discussion. Final design will follow these requirements.*

| Method | Endpoint | Purpose | Stage |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Create account | MVP |
| POST | `/api/auth/login` | Log in, return token | MVP |
| GET | `/api/users/me` | Current user and partner | MVP |
| PATCH | `/api/users/me` | Update name or time zone | MVP |
| POST | `/api/partner/request` | Request connection with a code | MVP |
| POST | `/api/partner/accept` | Accept a request | MVP |
| GET | `/api/partner` | Partner details and link status | MVP |
| DELETE | `/api/partner` | End connection | Later |
| GET | `/api/habits` | List my habits | MVP |
| POST | `/api/habits` | Create habit | MVP |
| PATCH | `/api/habits/:id` | Edit habit | MVP |
| DELETE | `/api/habits/:id` | Delete habit | MVP |
| GET | `/api/timeline?date=YYYY-MM-DD&user=me\|partner` | Entries for a day | MVP |
| POST | `/api/entries/:id/start` | Check in | MVP |
| POST | `/api/entries/:id/finish` | Mark completed | MVP |
| POST | `/api/entries/:id/leave-early` | Early exit with reason | MVP |
| PATCH | `/api/entries/:id` | Edit times or reason | MVP |
| POST | `/api/entries/:id/miss-note` | Explain a missed entry | Later |
| POST | `/api/entries/:id/reschedule` | Reschedule a missed entry | Later |
| POST | `/api/stickers` | Send a sticker | Later |
| GET | `/api/notifications` | List notifications | Later |

**Keeping the partner's view current.** For the MVP, the app can refresh the partner's timeline every few seconds while that screen is open. Real-time connections (such as WebSockets) can replace polling later (**Q15**).

---

## 11. Requirement Summary

### MVP checklist

| Area | Requirements |
| --- | --- |
| Accounts | AUTH-01 to 05, AUTH-07 |
| Partner connection | PTN-01 to 09, PTN-11 |
| Habits | HAB-01 to 10 |
| Alarms | ALM-01 to 08 |
| Check-in and timer | CHK-01 to 11 |
| Early exit | EXT-01 to 05 |
| Shared timeline | TML-01 to 13 |
| Profile | PRF-01 to 03 |

### Later

MIS-01 to 06, NTF-01 to 05, ENC-01 to 04, PRG-01 to 03, AUTH-06, PTN-10, ALM-09, CHK-12, PRF-04, PRF-05.

---

## 12. Assumptions and Open Questions

### 12.1 Assumptions

These were made to complete the draft. Each can be changed.

| # | Assumption |
| --- | --- |
| A1 | Users sign up with email and password. |
| A2 | Partners connect using a shareable invite code. |
| A3 | The code owner must accept a connection request before it activates. |
| A4 | Habit duration ranges from 1 minute to 12 hours. |
| A5 | A user may check in before the scheduled time. |
| A6 | Only one habit can be in progress at a time. |
| A7 | A habit is *Missed* once its full planned window has passed without a check-in (BR-10). |
| A8 | The partner can see that an entry was edited. |
| A9 | Times are stored in UTC and displayed in each person's own time zone. |
| A10 | A 5 second update target is acceptable for the partner's view. |

### 12.2 Open questions

| # | Question | Proposed default |
| --- | --- | --- |
| Q1 | Mobile only, or mobile plus web? | Mobile only for version 1. |
| Q2 | Which sign-in methods: email and password, Google, phone number? | Email and password first. |
| Q3 | Must a user be connected to a partner before using the app? | No. They can create habits, but sharing starts when connected. |
| Q4 | Can the connection work by searching email or username instead of a code? | Code only. |
| Q5 | Can two partners share one joint habit (for example "Gym together"), or are habits always individual? The earlier README says "create and track daily habits together." | Individual habits that the partner can see. |
| Q6 | What exactly counts as "missed"? | BR-10. |
| Q7 | Can a user have overlapping habits? | No, they can only run one at a time (A6). |
| Q8 | What happens at midnight to an entry still in progress? | It stays in progress until the timer ends, on its original date. |
| Q9 | Should alarms support snooze, custom sounds, or override silent mode? | Snooze later. Respect silent mode for now. |
| Q10 | Should the partner also be notified when someone checks in, completes or misses? | No, only schedule changes. |
| Q11 | Should the partner see the reason for a missed habit? | Yes. |
| Q12 | When a partnership ends, what is kept, and can the same pair reconnect? | Each user keeps their own data; partner view is removed. |
| Q13 | For partners in different time zones, whose time is shown? | Each viewer sees times in their own zone, with the owner's local time in the detail view. |
| Q14 | How should check-in work offline? | Queue and sync when online (Later). |
| Q15 | Polling or WebSockets for live updates? | Polling for the MVP. |
| Q16 | Minimum Android and iOS versions to support? | To be decided. |
| Q17 | Which languages should the app support? | English first. |
| Q18 | Will there be analytics, and if so, what is collected? | None in the MVP. |

---

## 13. Revision History

| Version | Date | Changes |
| --- | --- | --- |
| 1.0 | October 2026 | First full draft based on the project brief, README and product discussions. |