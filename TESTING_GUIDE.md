# Testing Guide for prompts.chat

This guide provides step-by-step instructions for manually testing all features of the prompts.chat application.

## Test Credentials

### Admin Users

| Name | Email | Username | Password | Role |
|------|-------|----------|----------|------|
| Admin User | admin@prompts.chat | admin | `password123` | ADMIN |
| Volue Demo | demo@volue.com | volue-demo | `demo123` | ADMIN |

### Regular Users (Volue)

All regular demo users use password: `demo123`

| Name | Email | Username |
|------|-------|----------|
| Erik Hansen | erik.hansen@volue.com | erik.hansen |
| Ingrid Berg | ingrid.berg@volue.com | ingrid.berg |
| Magnus Larsen | magnus.larsen@volue.com | magnus.larsen |
| Sofie Andersen | sofie.andersen@volue.com | sofie.andersen |
| Ole Nilsen | ole.nilsen@volue.com | ole.nilsen |
| Kari Johansen | kari.johansen@volue.com | kari.johansen |

### Quick Login Examples

```
# Admin login
Email: admin@prompts.chat
Password: password123

# Demo admin login
Email: demo@volue.com
Password: demo123

# Regular user login
Email: erik.hansen@volue.com
Password: demo123
```

---

## 1. Authentication & User Management

### 1.1 User Registration
1. Navigate to `/register`
2. Fill in the registration form:
   - Username (unique, alphanumeric)
   - Email (valid email format)
   - Password (minimum requirements)
3. Submit and verify:
   - [ ] Success message displayed
   - [ ] Redirected to login or home page
   - [ ] User can log in with new credentials

### 1.2 User Login
1. Navigate to `/login`
2. Test with valid credentials:
   - [ ] Login succeeds
   - [ ] Session persists across page refreshes
   - [ ] User menu shows correct name/avatar
3. Test with invalid credentials:
   - [ ] Error message displayed
   - [ ] No session created

### 1.3 User Logout
1. While logged in, click user menu
2. Click "Sign Out"
3. Verify:
   - [ ] Session cleared
   - [ ] Redirected appropriately
   - [ ] Protected pages no longer accessible

### 1.4 Profile Settings
1. Navigate to `/settings`
2. Test profile updates:
   - [ ] Change display name
   - [ ] Update avatar URL
   - [ ] Change username (if allowed)
3. Verify changes persist after refresh

### 1.5 API Key Management
1. Go to `/settings` → API Key section
2. Generate new API key:
   - [ ] Key is displayed
   - [ ] Key can be copied
3. Regenerate key:
   - [ ] Old key invalidated
   - [ ] New key works

---

## 2. Prompt Management

### 2.1 Browse Prompts
1. Navigate to `/prompts`
2. Test filtering:
   - [ ] Filter by category
   - [ ] Filter by type (TEXT, IMAGE, etc.)
   - [ ] Filter by tags
3. Test sorting:
   - [ ] Sort by newest
   - [ ] Sort by most upvoted
4. Test pagination:
   - [ ] Navigate between pages
   - [ ] Page size changes work

### 2.2 Create New Prompt
1. Navigate to `/prompts/new`
2. Fill in prompt details:
   ```
   Title: Test Prompt for QA
   Description: A test prompt to verify creation
   Content: You are a helpful assistant that...
   Category: Select appropriate category
   Tags: Add relevant tags
   ```
3. Verify:
   - [ ] Form validation works (required fields)
   - [ ] Prompt created successfully
   - [ ] Redirected to prompt detail page
   - [ ] Prompt appears in browse list

### 2.3 Edit Prompt
1. Navigate to a prompt you own
2. Click "Edit" button
3. Modify content:
   - [ ] Title change saves
   - [ ] Description change saves
   - [ ] Content change saves
   - [ ] Category/tags update
4. Verify version history created

### 2.4 Delete Prompt
1. Navigate to a prompt you own
2. Click "Delete" button
3. Confirm deletion
4. Verify:
   - [ ] Prompt removed from browse list
   - [ ] Appropriate redirect occurs
   - [ ] Soft delete (can be restored by admin)

### 2.5 View Prompt Details
1. Click on any prompt from browse page
2. Verify displayed information:
   - [ ] Title and description
   - [ ] Full prompt content
   - [ ] Author information
   - [ ] Vote count
   - [ ] Category and tags
   - [ ] Creation/update dates
   - [ ] Related prompts (if any)

### 2.6 Copy Prompt
1. On prompt detail page, click "Copy"
2. Verify:
   - [ ] Content copied to clipboard
   - [ ] Success feedback shown

---

## 3. Voting System

### 3.1 Upvote Prompt
1. While logged in, navigate to any prompt
2. Click upvote button
3. Verify:
   - [ ] Vote count increases
   - [ ] Button state changes (active)
   - [ ] Vote persists after refresh

### 3.2 Remove Vote
1. Click upvote button on already-voted prompt
2. Verify:
   - [ ] Vote count decreases
   - [ ] Button state returns to default

### 3.3 Voting Restrictions
1. Try to vote while logged out
2. Verify:
   - [ ] Prompted to log in
   - [ ] Vote not counted

---

## 4. Comments System

### 4.1 Add Comment
1. Navigate to any prompt detail page
2. Scroll to comments section
3. Enter comment text
4. Submit comment
5. Verify:
   - [ ] Comment appears immediately
   - [ ] Author name displayed
   - [ ] Timestamp shown

### 4.2 Reply to Comment
1. Find an existing comment
2. Click "Reply"
3. Enter reply text
4. Submit
5. Verify:
   - [ ] Reply appears nested under parent
   - [ ] Thread structure maintained

### 4.3 Edit Comment
1. Find your own comment
2. Click "Edit"
3. Modify text and save
4. Verify:
   - [ ] Changes saved
   - [ ] Edit indicator shown (if applicable)

### 4.4 Delete Comment
1. Find your own comment
2. Click "Delete"
3. Confirm deletion
4. Verify:
   - [ ] Comment removed or marked as deleted

### 4.5 Vote on Comments
1. Click upvote/downvote on a comment
2. Verify:
   - [ ] Score updates
   - [ ] Vote state persists

---

## 5. Collections & Pinning

### 5.1 Add to Collection
1. On prompt detail page, click "Save" or collection icon
2. Verify:
   - [ ] Prompt added to your collection
   - [ ] Icon state changes

### 5.2 View Collection
1. Navigate to `/collection`
2. Verify:
   - [ ] Saved prompts displayed
   - [ ] Can remove from collection
   - [ ] Proper pagination

### 5.3 Pin Prompt
1. On prompt detail page, click "Pin"
2. Navigate to your profile
3. Verify:
   - [ ] Pinned prompts shown prominently

---

## 6. Search & Discovery

### 6.1 Basic Search
1. Use the search bar in header
2. Enter search query
3. Verify:
   - [ ] Results match query
   - [ ] Results can be filtered
   - [ ] Pagination works

### 6.2 Category Browsing
1. Navigate to `/categories` or click a category
2. Verify:
   - [ ] Only prompts in category shown
   - [ ] Category info displayed
   - [ ] Subcategories accessible (if any)

### 6.3 Tag Browsing
1. Click on a tag anywhere in the app
2. Verify:
   - [ ] Filtered to prompts with that tag
   - [ ] Multiple tag filtering works

### 6.4 Discover Page
1. Navigate to `/discover`
2. Verify:
   - [ ] Featured prompts shown
   - [ ] Top prompts displayed
   - [ ] Recent prompts listed

---

## 7. User Profiles

### 7.1 View Public Profile
1. Click on any username in the app
2. Verify profile page shows:
   - [ ] User's display name
   - [ ] Avatar
   - [ ] Bio (if any)
   - [ ] Public prompts
   - [ ] Stats (prompt count, vote count)

### 7.2 Your Profile
1. Click on your avatar → View Profile
2. Verify:
   - [ ] All your prompts shown
   - [ ] Private prompts visible to you
   - [ ] Pinned prompts section

---

## 8. Change Requests

### 8.1 Submit Change Request
1. Navigate to a prompt you don't own
2. Click "Suggest Edit" or similar
3. Fill in:
   - Proposed changes to content
   - Reason for change
4. Submit
5. Verify:
   - [ ] Change request created
   - [ ] Status shows as "Pending"

### 8.2 Review Change Request (as author)
1. Check notifications for change request
2. Navigate to the change request
3. Review proposed changes
4. Approve or reject
5. Verify:
   - [ ] Approval applies changes
   - [ ] Rejection keeps original
   - [ ] Requester notified

---

## 9. Notifications

### 9.1 Receive Notifications
1. Have another user:
   - Comment on your prompt
   - Reply to your comment
2. Check notification bell
3. Verify:
   - [ ] Notification appears
   - [ ] Unread count correct
   - [ ] Click navigates to source

### 9.2 Mark as Read
1. Open notifications
2. Click on a notification
3. Verify:
   - [ ] Marked as read
   - [ ] Unread count decreases

---

## 10. Admin Features

> Requires admin login (admin@prompts.chat)

### 10.1 Admin Dashboard
1. Navigate to `/admin`
2. Verify dashboard shows:
   - [ ] User count
   - [ ] Prompt count
   - [ ] Pending reports
   - [ ] Recent activity

### 10.2 User Management
1. Go to Admin → Users
2. Test:
   - [ ] List all users
   - [ ] Search users
   - [ ] Edit user details
   - [ ] Change user role
   - [ ] Flag/unflag user

### 10.3 Prompt Moderation
1. Go to Admin → Prompts
2. Test:
   - [ ] List all prompts (including private)
   - [ ] Feature a prompt
   - [ ] Unlist a prompt
   - [ ] Delete a prompt
   - [ ] Restore deleted prompt

### 10.4 Category Management
1. Go to Admin → Categories
2. Test:
   - [ ] Create new category
   - [ ] Edit category (name, icon, order)
   - [ ] Create subcategory
   - [ ] Delete category

### 10.5 Tag Management
1. Go to Admin → Tags
2. Test:
   - [ ] Create new tag
   - [ ] Edit tag (name, color)
   - [ ] Delete tag
   - [ ] Merge tags (if available)

### 10.6 Report Handling
1. Go to Admin → Reports
2. For each report:
   - [ ] View report details
   - [ ] View reported content
   - [ ] Mark as resolved
   - [ ] Dismiss report
   - [ ] Take action on content

### 10.7 Webhook Management
1. Go to Admin → Webhooks
2. Test:
   - [ ] Create webhook
   - [ ] Configure events
   - [ ] Test webhook delivery
   - [ ] Edit webhook
   - [ ] Disable/delete webhook

---

## 11. API Testing

### 11.1 Public Endpoints
```bash
# List prompts
curl http://localhost:3000/api/prompts

# Get single prompt
curl http://localhost:3000/api/prompts/{id}

# Search prompts
curl "http://localhost:3000/api/prompts?search=test"

# Health check
curl http://localhost:3000/api/health
```

### 11.2 Authenticated Endpoints
```bash
# Set your API key
API_KEY="your-api-key"

# Create prompt
curl -X POST http://localhost:3000/api/prompts \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content"}'

# Vote on prompt
curl -X POST http://localhost:3000/api/prompts/{id}/vote \
  -H "Authorization: Bearer $API_KEY"
```

### 11.3 Export Endpoints
```bash
# JSON export
curl http://localhost:3000/prompts.json

# CSV export
curl http://localhost:3000/prompts.csv
```

---

## 12. Responsive Design Testing

### 12.1 Mobile (320px - 480px)
- [ ] Navigation menu collapses
- [ ] Prompt cards stack vertically
- [ ] Forms are usable
- [ ] Buttons are tap-friendly

### 12.2 Tablet (768px - 1024px)
- [ ] Two-column layouts work
- [ ] Sidebar collapsible
- [ ] Modal sizing appropriate

### 12.3 Desktop (1024px+)
- [ ] Full navigation visible
- [ ] Multi-column grids
- [ ] Side panels functional

---

## 13. Accessibility Testing

### 13.1 Keyboard Navigation
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals

### 13.2 Screen Reader
- [ ] Page headings structured
- [ ] Images have alt text
- [ ] Form labels associated
- [ ] ARIA labels present

### 13.3 Color & Contrast
- [ ] Text readable on backgrounds
- [ ] Color not only indicator
- [ ] Dark mode accessible

---

## 14. Performance Testing

### 14.1 Page Load Times
- [ ] Home page < 3s
- [ ] Prompt list < 2s
- [ ] Prompt detail < 2s
- [ ] Search results < 2s

### 14.2 Interactions
- [ ] Vote response < 500ms
- [ ] Comment post < 1s
- [ ] Search autocomplete < 300ms

---

## 15. Error Handling

### 15.1 404 Pages
1. Navigate to `/nonexistent-page`
2. Verify:
   - [ ] Custom 404 page shown
   - [ ] Navigation still works

### 15.2 Network Errors
1. Disable network, try actions
2. Verify:
   - [ ] Error messages shown
   - [ ] App doesn't crash
   - [ ] Retry options available

### 15.3 Form Validation
1. Submit forms with invalid data
2. Verify:
   - [ ] Validation messages clear
   - [ ] Fields highlighted
   - [ ] Submit blocked until valid

---

## Test Checklist Summary

| Area | Tests | Status |
|------|-------|--------|
| Authentication | 5 | [ ] |
| Prompts CRUD | 6 | [ ] |
| Voting | 3 | [ ] |
| Comments | 5 | [ ] |
| Collections | 3 | [ ] |
| Search | 4 | [ ] |
| Profiles | 2 | [ ] |
| Change Requests | 2 | [ ] |
| Notifications | 2 | [ ] |
| Admin | 7 | [ ] |
| API | 3 | [ ] |
| Responsive | 3 | [ ] |
| Accessibility | 3 | [ ] |
| Performance | 2 | [ ] |
| Error Handling | 3 | [ ] |

---

## Running Automated Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/__tests__/api/prompts.test.ts
```

---

## Reporting Issues

When reporting bugs found during testing:

1. **Title:** Brief description of the issue
2. **Steps to Reproduce:** Numbered steps
3. **Expected Result:** What should happen
4. **Actual Result:** What actually happened
5. **Environment:** Browser, OS, screen size
6. **Screenshots/Videos:** If applicable
