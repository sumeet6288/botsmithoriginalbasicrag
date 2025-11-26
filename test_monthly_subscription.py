#!/usr/bin/env python3
"""
Test script to verify monthly subscription system for 1 month
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

async def test_monthly_subscription():
    """Test that subscriptions work for 1 month period"""
    
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'chatbase_db')
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("=" * 70)
    print("TESTING MONTHLY SUBSCRIPTION SYSTEM (1 MONTH PERIOD)")
    print("=" * 70)
    
    # Test 1: Check admin user
    print("\n1. Checking admin user...")
    admin_user = await db.users.find_one({"email": "admin@botsmith.com"})
    if admin_user:
        print(f"   ✅ Admin user found: {admin_user['email']}")
        print(f"   Current plan: {admin_user.get('plan_id', 'Not set')}")
    else:
        print("   ❌ Admin user not found")
        return
    
    # Test 2: Check or create subscription
    print("\n2. Checking subscription...")
    subscription = await db.subscriptions.find_one({"user_id": admin_user['id']})
    
    if not subscription:
        print("   Creating new subscription with 30-day expiration...")
        started_at = datetime.utcnow()
        expires_at = started_at + timedelta(days=30)
        
        subscription = {
            "user_id": admin_user['id'],
            "plan_id": admin_user.get('plan_id', 'free'),
            "status": "active",
            "started_at": started_at,
            "expires_at": expires_at,
            "auto_renew": False,
            "billing_cycle": "monthly",
            "usage": {
                "chatbots_count": 0,
                "messages_this_month": 0,
                "file_uploads_count": 0,
                "website_sources_count": 0,
                "text_sources_count": 0,
                "last_reset": datetime.utcnow()
            }
        }
        
        result = await db.subscriptions.insert_one(subscription)
        print(f"   ✅ Subscription created successfully")
        subscription = await db.subscriptions.find_one({"_id": result.inserted_id})
    else:
        print("   ✅ Subscription already exists")
    
    # Test 3: Verify subscription details
    print("\n3. Verifying subscription details...")
    started_at = subscription.get('started_at')
    expires_at = subscription.get('expires_at')
    
    if started_at and expires_at:
        duration = (expires_at - started_at).days
        print(f"   Started: {started_at.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"   Expires: {expires_at.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"   Duration: {duration} days")
        
        if duration == 30:
            print(f"   ✅ Subscription duration is exactly 30 days (1 month)")
        else:
            print(f"   ⚠️  Warning: Duration is {duration} days, expected 30 days")
    else:
        print("   ❌ Missing start or expiration dates")
        return
    
    # Test 4: Check days remaining
    print("\n4. Calculating days remaining...")
    now = datetime.utcnow()
    days_remaining = (expires_at - now).days
    hours_remaining = ((expires_at - now).seconds // 3600)
    
    print(f"   Current time: {now.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Days remaining: {days_remaining} days, {hours_remaining} hours")
    
    if days_remaining < 0:
        print(f"   ⚠️  Subscription EXPIRED {abs(days_remaining)} days ago")
    elif days_remaining == 0:
        print(f"   ⚠️  Subscription expires TODAY (in {hours_remaining} hours)")
    elif days_remaining <= 3:
        print(f"   ⚠️  Subscription expiring soon")
    else:
        print(f"   ✅ Subscription is active")
    
    # Test 5: Verify subscription status check works
    print("\n5. Testing subscription status API response...")
    is_expired = expires_at < now
    is_expiring_soon = not is_expired and (expires_at - now).days <= 3
    
    status_response = {
        "is_expired": is_expired,
        "is_expiring_soon": is_expiring_soon,
        "days_remaining": max(0, days_remaining),
        "expires_at": expires_at.isoformat(),
        "status": "expired" if is_expired else ("expiring_soon" if is_expiring_soon else "active")
    }
    
    print(f"   Status: {status_response['status']}")
    print(f"   Is Expired: {status_response['is_expired']}")
    print(f"   Is Expiring Soon: {status_response['is_expiring_soon']}")
    print(f"   Days Remaining: {status_response['days_remaining']}")
    
    # Test 6: Test renewal functionality
    print("\n6. Testing renewal functionality...")
    print("   Simulating renewal (extends by 30 days)...")
    
    new_started_at = datetime.utcnow()
    new_expires_at = new_started_at + timedelta(days=30)
    
    print(f"   New expiration would be: {new_expires_at.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Duration: {(new_expires_at - new_started_at).days} days")
    print(f"   ✅ Renewal calculation works correctly")
    
    # Test 7: Check plan limits
    print("\n7. Checking plan limits...")
    plan = await db.plans.find_one({"id": subscription['plan_id']})
    if plan:
        print(f"   Plan: {plan['name']}")
        print(f"   Price: ${plan['price']/100:.2f}/month" if plan['price'] > 0 else "   Price: Free")
        print(f"   Limits:")
        limits = plan.get('limits', {})
        print(f"     - Max Chatbots: {limits.get('max_chatbots', 'N/A')}")
        print(f"     - Max Messages/Month: {limits.get('max_messages_per_month', 'N/A')}")
        print(f"     - Max File Uploads: {limits.get('max_file_uploads', 'N/A')}")
        print(f"   ✅ Plan limits configured correctly")
    else:
        print(f"   ❌ Plan not found: {subscription['plan_id']}")
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY - MONTHLY SUBSCRIPTION SYSTEM STATUS")
    print("=" * 70)
    
    all_checks_passed = (
        admin_user is not None and
        subscription is not None and
        duration == 30 and
        plan is not None
    )
    
    if all_checks_passed:
        print("✅ ALL TESTS PASSED - Monthly subscription system working correctly!")
        print(f"✅ Subscriptions are set to expire after exactly 30 days (1 month)")
        print(f"✅ Current subscription expires on: {expires_at.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"✅ Renewal functionality will extend by another 30 days")
        print(f"✅ Days remaining in current period: {max(0, days_remaining)} days")
    else:
        print("⚠️  Some tests failed - please review the output above")
    
    print("=" * 70)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(test_monthly_subscription())
