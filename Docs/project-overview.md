# Dot: Project Overview

**Tagline:** Build better habits, together.
**Version:** 1.0 | **Date:** October 2026 | **Status:** In development (pre-MVP)
**Related document:** [Requirements Document](./Specific-requirement.md)

---


---

## 1. Summary

Dot is a shared habit and routine tracker for two people: a couple, or a pair of close friends. Each person plans their own routines, such as going to the gym, studying, or keeping a sleep schedule. Both people see a shared timeline that shows what is planned, what has actually started, how long it lasted, and what was missed and why.

Dot is built on one idea: habits are easier to keep when someone you care about can see them and cheer you on. Accountability comes from awareness and encouragement, never from pressure or competition.

| | |
| --- | --- |
| **Product type** | Mobile app (see [Section 10](#10-technology-overview)) |
| **Primary users** | Couples building routines together |
| **Secondary users** | Close friends and accountability partners |
| **Core idea** | A shared, honest, real-time timeline of each partner's habits |
| **Connection model** | One user connects with exactly one partner |
| **Current stage** | In development, working toward the MVP |

---

## 2. The Problem

Most habit trackers are designed around a single user. You set a goal, tick a box, and the only person who knows whether you followed through is you. Missing a day is invisible to everyone else, so motivation depends entirely on self-discipline.

People who want to build routines with a partner face specific problems:

| Problem | What happens today |
| --- | --- |
| **No shared view of the day** | There is no simple way to see what a partner is doing right now compared with what they planned. |
| **Silent misses** | When someone skips a habit, the other person finds out late, or only by asking. |
| **Missing context** | A missed day is just a missed day. The reason, which is what makes support possible, is lost. |
| **Plans change without notice** | If one partner moves their schedule, the other is left guessing. |
| **Fading motivation** | Encouragement happens ad hoc in messages, disconnected from the habit itself. |

---

## 3. The Solution

Dot turns habit tracking into something two people do together.

| Problem | How Dot responds |
| --- | --- |
| No shared view of the day | A shared timeline shows each partner's current activity and progress. |
| Misses go unnoticed | Partners see completed, in-progress and missed habits as they happen. |
| Missed habits lack context | A habit that ends early must include a reason, and a missed habit can be explained or rescheduled, so the reason is always visible. |
| Schedule changes are unclear | When one partner changes a schedule, the other is notified. |
| Motivation fades | Partners can encourage each other, including with motivation stickers. |

**What makes Dot different**

- **It records reality, not intention.** If a user plans the gym for 7:00 but checks in at 7:25, the timeline shows 7:25. Between 7:00 and 7:25, the partner sees that the user is not at the gym yet.
- **It has no fixed schedule.** Each user sets their own start time and duration for every habit.
- **It is built for exactly two people.** This keeps the experience personal and supportive instead of social or competitive.
- **Missing a habit is a conversation, not a failure.** The user explains or reschedules, and the partner sees the context.

---

## 4. Target Users

### Primary: couples

Dot's main focus. Two partners build shared routines, stay connected through the day, and support each other's goals, from workouts to study time to sleep schedules.

### Secondary: friends

Close friends, workout partners and study partners can use the same one-to-one connection to hold each other accountable in a friendly way.

### Illustrative personas

These are examples used in designs and documentation, not research findings.

| | Aman | Simran |
| --- | --- | --- |
| **Role** | Partner A | Partner B |
| **Habits** | Gym at 7:00 AM (1h 30m), study in the evening | Reading, sleep routine, morning walk |
| **Goal** | Stay consistent with workouts | Build a regular sleep schedule |
| **Frustration** | Skips the gym and nobody notices until later | Doesn't know whether Aman is busy or just skipped |
| **What they want from Dot** | A gentle push and a place to explain a missed day | To see Aman's day and send encouragement |

---

## 5. How Dot Works

### 5.1 The core flow

1. **Connect.** Two users connect as partners and can now see each other's shared timeline.
2. **Plan.** Each user creates habits with a start time and a duration, for example Gym at 7:00 AM for 1 hour 30 minutes.
3. **Alarm.** At the scheduled time, an alarm rings on the user's phone.
4. **Check in.** The user taps "I'm at the gym." The timeline logs the real check-in time.
5. **Timer.** A timer starts for the duration the user chose. The partner sees the habit in progress.
6. **Finish or leave early.** If the timer completes, the habit is logged as completed. If the user leaves early, they must add a reason, and the partner sees the time actually spent and the reason.
7. **Missed habit.** If a habit is missed, the user either adds an explanation or reschedules it for another time.
8. **Schedule change.** If a partner changes their schedule, the other partner is notified.

The timeline is editable, so users can correct entries.

### 5.2 Worked example

| Time | What the user does | What the partner sees |
| --- | --- | --- |
| 7:00 AM | Alarm rings. User has not checked in. | Gym planned. User is not at the gym yet. |
| 7:25 AM | Taps "I'm at the gym." Timer (1h 30m) starts. | User at the gym since 7:25, not 7:00. |
| Early exit | Leaves early and adds a reason. | Time actually spent, plus the reason. |
| Full session | Timer completes at 8:55. | Habit completed for the full 1h 30m. |

Early exit and full session are two alternative outcomes of the same session.

### 5.3 Habit status lifecycle

```
Planned --> Not started yet --> In progress --> Completed
                |                    |
                |                    +--> Left early (reason required)
                |
                +--> Missed --> Explained
                          \--> Rescheduled
```

| Status | Meaning |
| --- | --- |
| Planned | The habit is scheduled for later today. |
| Not started yet | The scheduled time has passed and the user has not checked in. |
| In progress | The user has checked in and the timer is running. |
| Completed | The timer finished. |
| Left early | The user ended the habit before the timer finished and gave a reason. |
| Missed | The habit was not done in its window. *(post-MVP)* |
| Rescheduled | The user moved a missed habit to another time. *(post-MVP)* |

---

## 6. Features

| Feature | What it does | Stage |
| --- | --- | --- |
| Partner connection | Connect with one person and share daily progress. | MVP |
| Habits and routines | Create habits (workouts, studying, sleep) with your own start time, duration and repeat days. | MVP |
| Smart alarms | An alarm rings at the scheduled time of each habit. | MVP |
| Check-in and timer | Manual check-in logs the real start time and starts a countdown for the chosen duration. | MVP |
| Early exit with reason | Leaving before the timer ends requires a reason, which the partner can see. | MVP |
| Shared timeline | Shows each partner's activities with real check-in times, time spent and status. Editable. | MVP |
| Missed habit notes | Explain a missed habit or reschedule it. | After MVP |
| Progress tracking | See completed and missed habits over time. | After MVP |
| Schedule-change notifications | Notify a partner when the other changes a schedule. | After MVP |
| Motivation stickers and encouragement | Send encouragement to your partner. More features are planned. | After MVP |

---

## 7. MVP Scope

The first release proves the core idea: two people connected, keeping each other informed, sticking to a routine.

### In the MVP

- Account creation and login
- Partner connection between two users
- Habit setup with start time, duration and repeat days
- Alarm at the scheduled time
- Manual check-in and countdown timer
- Early exit with a required reason
- Shared timeline showing real check-in times, with the partner's timeline viewable and read-only
- Editable timeline entries for the owner

### After the MVP

- Notifications for schedule changes
- Missed habit explanation and rescheduling
- Progress views
- Motivation stickers and further encouragement features

### Out of scope for version 1

- More than two people in one connection
- Group challenges, leaderboards or any competitive feature
- Automatic check-in (GPS, sensors, wearables), because check-in is deliberately manual
- A full web version of the app

### The MVP is done when

Two people can create accounts and connect. Each can create a habit with an alarm, receive the alarm, check in, run the timer, and finish or leave early with a reason. Each can see the other's timeline update accurately.

---

## 8. Product Principles

These principles guide every product and design decision.

1. **Encouragement over pressure.** The app supports; it never shames. Screens, messages and notifications use warm, supportive language.
2. **Honesty over perfection.** Real times are recorded, not idealized ones, and that is accepted without judgment.
3. **Context over judgment.** Reasons turn misses into understanding.
4. **Two people, not a crowd.** One-to-one connection keeps it personal.
5. **Flexibility over rigid schedules.** Users set their own times and durations.
6. **Control over your own data.** Only the connected partner can see a user's timeline, and only the owner can edit it.

---

## 9. Design Direction

The visual identity is playful, bold, friendly and rounded.

| Element | Direction |
| --- | --- |
| **Mood** | Warm, encouraging, lighthearted |
| **Logo and characters** | Two smiling overlapping circles, coral and purple, joined by a heart. They represent "you" and "your partner" and act as Dot's mascots. |
| **Typography** | A chunky, heavy display font for headings, large numbers and buttons (Bricolage Grotesque ExtraBold or similar). A clean sans for body text (DM Sans). |
| **Shapes** | Large rounded cards, pill buttons, flat colors, no heavy shadows. |
| **Color moments** | Full-screen blue for the welcome screen, lime green for the active timer. Pastel color-coded habit tiles. |

**Estimated color palette** (adjust to match final designs)

| Role | Color |
| --- | --- |
| Coral (you) | `#FF6B7F` |
| Purple (partner) | `#7B6CF6` |
| Welcome blue | `#5057DB` |
| Timer lime | `#C5EE7B` |
| Tile yellow | `#F4D06F` |
| Tile pink | `#F095C4` |
| Tile sky blue | `#A8C5F7` |
| Surface / background | `#F5F5F7` / `#FFFFFF` |
| Ink / muted text | `#111111` / `#6B6B76` |

A reference screenshot was used for mood and layout only. Dot uses its own mascots from the logo.

---

## 10. Technology Overview

| Layer | Technology | Role |
| --- | --- | --- |
| Client app | React Native with Expo (recommended) | The interface: timelines, habit setup, timers, alarms and notifications. |
| Backend | Node.js, Express.js | API for accounts, partner connections, habits and timeline data. |
| Database | MongoDB | Stores users, partner links, habits and timeline entries. |

**Platform decision.** Dot's alarm and timer need to work with the screen off and the app closed, which a mobile app does reliably and a web app does not. The project's earlier README listed React.js for the frontend; that decision is now superseded by a mobile client unless a web version is added later. This choice should be confirmed ([Section 13](#13-open-items)).

**Architecture at a glance**

```
 Partner A phone ----\                       /---- Partner B phone
 (React Native app)   \                     /      (React Native app)
                       +---> Express API <-+
                       |     (Node.js)     |
                       +---> MongoDB <-----+
```

- Alarms and the countdown timer run **on the device**, so they work offline.
- Timeline data is saved through the API so the partner's app can show it.
- Development and testing use Expo Go on a physical phone. A development build may be needed later if alarm features require custom native code.

---

## 11. Status and Roadmap

**Current status:** In development. Documentation and UI design are underway, and the first screens are being built.

| Phase | Focus | Includes |
| --- | --- | --- |
| 1. MVP | Core connection | Accounts, partner connection, habit setup, alarms, check-in and timer, early exit reason, shared timeline. |
| 2. Awareness | Keep partners in sync | Schedule-change notifications, missed habit explanation and rescheduling, progress views. |
| 3. Encouragement | Strengthen motivation | Motivation stickers and further features that help partners support each other. |

No dates are committed yet.

---

## 12. Risks and Challenges

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| **Alarm reliability** | Phones restrict background activity, and silent mode or battery optimization can block alarms. Alarms are central to the MVP. | Use scheduled local notifications, test on real Android and iOS devices early, and document phone settings users may need. |
| **Timer accuracy** | Timers can pause when an app is in the background. | Calculate remaining time from stored start time rather than counting seconds in the app. |
| **Privacy of shared data** | Timelines and reasons are personal. | Share only with the connected partner, enforce permissions on the server, and offer account deletion. |
| **Time zones** | Long-distance partners may live in different zones. | Store times in UTC and decide how each partner's times are displayed. |
| **Sustained use** | Habit apps often lose users after the first weeks. | Keep the tone supportive and make the partner connection the reason to return. |
| **First-time mobile build** | The team is new to React Native. | Build one screen at a time and test on a real phone from day one. |

---

## 13. Open Items

These need decisions, and some matter for investors and judges.

| # | Question |
| --- | --- |
| 1 | Is Dot a mobile app only, or mobile plus web? |
| 2 | How will Dot make money (free, freemium, subscription)? |
| 3 | Who is on the team, and what does each person do? |
| 4 | Which existing apps are competitors, and how is Dot better? |
| 5 | What does success look like in one year? |
| 6 | Why is the product called "Dot"? |
| 7 | Are habits individual only, or can two partners share one joint habit? |

More product-level questions are in the [Requirements Document](./requirements.md#12-assumptions-and-open-questions).

---

## 14. Glossary

| Term | Meaning |
| --- | --- |
| **Partner** | The one other user a person is connected with. |
| **Habit** | A routine a user wants to keep, such as Gym, with a start time and duration. |
| **Habit entry** | One occurrence of a habit on a specific day. |
| **Check-in** | The user's manual tap to say they have started (e.g. "I'm at the gym"). |
| **Timeline** | The day view of habit entries with times and statuses. |
| **Planned time** | The time the user scheduled. |
| **Actual time** | The time the user really checked in. |
| **Early exit** | Ending a habit before its timer finishes. |
| **MVP** | Minimum viable product, the smallest first release. |

---

*Document history: v1.0, October 2026, first full draft.*