# Milestone 2: Engagement Frequency & Email Digests

## ✅ Phase 1 & 2: COMPLETE

### What's Been Implemented

1. **Engagement Frequency Settings**
   - Added frequency selector to contact form (weekly, bi-weekly, monthly, quarterly, bi-annually, annually)
   - Contacts can now have a desired re-engagement frequency

2. **Visual Due Status Indicators**
   - Contact cards now display status badges:
     - 🔴 **Overdue** (red) - Past the engagement frequency target
     - 🟡 **Due Soon** (yellow) - Within 80% of the target timeframe
     - 🟢 **On Track** (green) - Recently contacted
   - Status is calculated based on last interaction date and frequency setting

3. **Dashboard Filtering & Sorting**
   - Filter tabs: "All Contacts" | "Due & Overdue" | "On Track"
   - Contacts automatically sorted by priority (overdue first)
   - Badge counts showing how many contacts in each category

---

## 🚀 Phase 3: Email Digest (Coming Next)

### What Will Be Implemented

A manual "Send Me a Digest" button that generates and emails a personalized list of contacts due for outreach, including:
- Contact name and relationship type
- Last interaction date and notes
- Context to help personalize outreach

### Resend Setup Instructions

To enable email digests, you'll need a **Resend** account:

#### Step 1: Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. You get **100 free emails per day** on the free tier

#### Step 2: Verify Your Email Domain
1. Navigate to [https://resend.com/domains](https://resend.com/domains)
2. Add your domain (or use Resend's test domain for development)
3. Follow the verification steps (add DNS records)
4. ⚠️ **Common mistake**: Forgetting to verify the domain will cause emails to fail

#### Step 3: Create API Key
1. Go to [https://resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it (e.g., "Personal Network CRM")
4. Select "Sending access" permission
5. Copy the API key (starts with `re_...`)
6. ⚠️ **Important**: Save this key securely - you won't be able to see it again!

#### Step 4: Add Secret to Lovable Cloud
When we implement the email digest feature, I'll ask you to provide the `RESEND_API_KEY` through Lovable's secure secrets manager.

---

## 📋 Implementation Plan for Phase 3

### Backend (Edge Function)
- Create `supabase/functions/send-digest/index.ts`
- Calculate due contacts based on engagement frequency
- Generate HTML email with:
  - Contact names and relationship types
  - Days since last contact
  - Personalized context notes
- Send via Resend API

### Frontend Updates
- Add "Email Settings" dialog for user to enter their email address (stored in localStorage)
- Add "Send Me a Digest" button to Dashboard
- Show success toast when email is sent
- Handle errors gracefully (e.g., missing email, Resend API errors)

### Future Enhancement (Milestone 2 Phase 4)
- Automated weekly emails (using Supabase cron jobs)
- User preferences for digest frequency and timezone
- Email digest preview before sending
- Opt-out mechanism

---

## 🎯 Current Status

**Ready for Phase 3 when you are!** 

Let me know when you'd like to proceed with implementing the email digest feature, and make sure you have your Resend API key ready.
