#!/usr/bin/env python3
"""
Comprehensive Playwright testing for Airborne Aviation web application.
Tests both public website (port 3000) and admin panel (port 4000).
"""

from playwright.sync_api import sync_playwright
import json
import time
import sys

def test_public_website(page):
    """Test the public marketing website on port 3000"""
    results = {
        "site": "public",
        "url": "http://localhost:3000",
        "tests": []
    }
    
    def record_test(name, passed, details=""):
        results["tests"].append({
            "name": name,
            "passed": passed,
            "details": details
        })
        status = "✓" if passed else "✗"
        print(f"  {status} {name}: {details}")
    
    print("\n=== Testing Public Website (port 3000) ===")
    
    # 1. Homepage load
    try:
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=30000)
        page.wait_for_load_state("networkidle")
        record_test("Homepage loads", True, f"Title: {page.title()}")
    except Exception as e:
        record_test("Homepage loads", False, str(e))
        return results
    
    # 2. Check for key sections
    sections_to_check = [
        ("Hero section", "h1", "Airborne"),
        ("Navigation", "nav", None),
        ("Courses section", "text=Courses", None),
        ("About section", "text=About", None),
        ("Footer", "footer", None),
    ]
    
    for name, selector, text in sections_to_check:
        try:
            if text:
                locator = page.locator(f"{selector}:has-text('{text}')")
            else:
                locator = page.locator(selector)
            count = locator.count()
            record_test(f"Has {name}", count > 0, f"Found {count} elements")
        except Exception as e:
            record_test(f"Has {name}", False, str(e))
    
    # 3. Test navigation links
    nav_links = [
        ("/courses", "Courses page"),
        ("/about", "About page"),
        ("/contact", "Contact page"),
        ("/jobs", "Jobs page"),
        ("/blog", "Blog page"),
    ]
    
    for path, name in nav_links:
        try:
            page.goto(f"http://localhost:3000{path}", wait_until="networkidle", timeout=15000)
            record_test(f"Navigate to {name}", True, f"Status: {page.url}")
        except Exception as e:
            record_test(f"Navigate to {name}", False, str(e))
    
    # 4. Test course pages
    course_pages = [
        "/courses/commercial-pilot-license-cpl",
        "/courses/atpl",
        "/courses/cadet-preparation",
        "/courses/cabin-crew-training",
        "/courses/a320-simulator",
    ]
    
    for path in course_pages:
        try:
            page.goto(f"http://localhost:3000{path}", wait_until="networkidle", timeout=15000)
            has_content = page.locator("h1").count() > 0
            record_test(f"Course page {path}", has_content, f"Title: {page.title()}")
        except Exception as e:
            record_test(f"Course page {path}", False, str(e))
    
    # 5. Test blog pages
    blog_pages = [
        "/blog/dgca-ground-school-guide",
        "/blog/how-to-become-pilot-india",
        "/blog/pilot-salary-india",
    ]
    
    for path in blog_pages:
        try:
            page.goto(f"http://localhost:3000{path}", wait_until="networkidle", timeout=15000)
            has_content = page.locator("article, main").count() > 0
            record_test(f"Blog page {path}", has_content, f"Title: {page.title()}")
        except Exception as e:
            record_test(f"Blog page {path}", False, str(e))
    
    # 6. Check for 3D content (Home3DSection)
    try:
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=15000)
        canvas = page.locator("canvas")
        record_test("3D Canvas present", canvas.count() > 0, f"Found {canvas.count()} canvas elements")
    except Exception as e:
        record_test("3D Canvas present", False, str(e))
    
    # 7. Test lead form
    try:
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=15000)
        # Scroll to find form
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(1000)
        
        form = page.locator("form")
        if form.count() > 0:
            # Try filling form
            name_input = page.locator("input[name='name'], input[placeholder*='Name='name'], input[id='name']").first
            phone_input = page.locator("input[name='phone'], input[placeholder*='phone' i], input[id='phone']").first
            email_input = page.locator("input[name='email'], input[placeholder*='email' i], input[id='email']").first
            
            if name_input.count() > 0:
                name_input.fill("Test User")
                phone_input.fill("9876543210")
                email_input.fill("test@example.com")
                record_test("Lead form fillable", True, "Form fields found and fillable")
            else:
                record_test("Lead form fillable", False, "No name input found")
        else:
            record_test("Lead form exists", False, "No form found")
    except Exception as e:
        record_test("Lead form test", False, str(e))
    
    # 8. Check responsive design
    try:
        page.set_viewport_size({"width": 375, "height": 667})  # Mobile
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=15000)
        mobile_nav = page.locator("[class*='mobile'], [class*='hamburger'], button[aria-label*='menu']")
        record_test("Mobile navigation", mobile_nav.count() > 0, f"Mobile nav elements: {mobile_nav.count()}")
        
        page.set_viewport_size({"width": 1920, "height": 1080})  # Desktop
    except Exception as e:
        record_test("Responsive design", False, str(e))
    
    # 9. Performance metrics
    try:
        metrics = page.evaluate("""() => {
            const perf = performance.getEntriesByType('navigation')[0];
            return {
                domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
                loadComplete: perf.loadEventEnd - perf.loadEventStart,
                totalTime: perf.loadEventEnd - perf.fetchStart
            };
        }""")
        record_test("Performance metrics", True, f"DOM: {metrics['domContentLoaded']:.0f}ms, Load: {metrics['loadComplete']:.0f}ms, Total: {metrics['totalTime']:.0f}ms")
    except Exception as e:
        record_test("Performance metrics", False, str(e))
    
    return results


def test_admin_panel(page):
    """Test the admin panel on port 4000"""
    results = {
        "site": "admin",
        "url": "http://localhost:4000",
        "tests": []
    }
    
    def record_test(name, passed, details=""):
        results["tests"].append({
            "name": name,
            "passed": passed,
            "details": details
        })
        status = "✓" if passed else "✗"
        print(f"  {status} {name}: {details}")
    
    print("\n=== Testing Admin Panel (port 4000) ===")
    
    # 1. Login page
    try:
        page.goto("http://localhost:4000/login", wait_until="networkidle", timeout=30000)
        record_test("Login page loads", True, f"Title: {page.title()}")
    except Exception as e:
        record_test("Login page loads", False, str(e))
        return results
    
    # 2. Check login form elements
    try:
        email_input = page.locator("input[type='email'], input[name='email']")
        password_input = page.locator("input[type='password'], input[name='password']")
        submit_button = page.locator("button[type='submit'], button:has-text('Sign in'), button:has-text('Login')")
        
        record_test("Login form fields", 
            email_input.count() > 0 and password_input.count() > 0 and submit_button.count() > 0,
            f"Email: {email_input.count()}, Password: {password_input.count()}, Submit: {submit_button.count()}")
    except Exception as e:
        record_test("Login form fields", False, str(e))
    
    # 3. Try to access protected routes (should redirect to login)
    protected_routes = [
        ("/dashboard", "Dashboard"),
        ("/admissions", "Admissions"),
        ("/leads", "Leads"),
        ("/courses", "Courses admin"),
        ("/jobs", "Jobs admin"),
        ("/students", "Students"),
        ("/placements", "Placements"),
        ("/resources", "Resources"),
        ("/testimonials", "Testimonials"),
        ("/users", "Users"),
        ("/settings", "Settings"),
        ("/cms", "CMS"),
        ("/blog", "Blog admin"),
        ("/media", "Media"),
        ("/notifications", "Notifications"),
        ("/audit", "Audit"),
        ("/errors", "Errors"),
    ]
    
    for path, name in protected_routes:
        try:
            page.goto(f"http://localhost:4000{path}", wait_until="networkidle", timeout=15000)
            # Should redirect to login
            current_url = page.url
            is_redirected = "login" in current_url or "auth" in current_url
            record_test(f"Protected route {name}", is_redirected, f"Redirected to: {current_url}")
        except Exception as e:
            record_test(f"Protected route {name}", False, str(e))
    
    # 4. Test API endpoints (public)
    public_apis = [
        "/api/public/blogs",
        "/api/public/courses",
        "/api/public/jobs",
        "/api/public/leads",
        "/api/public/pages",
        "/api/public/placements",
        "/api/public/resources",
        "/api/public/settings",
        "/api/public/testimonials",
    ]
    
    for api in public_apis:
        try:
            response = page.request.get(f"http://localhost:4000{api}")
            record_test(f"Public API {api}", response.ok, f"Status: {response.status}")
        except Exception as e:
            record_test(f"Public API {api}", False, str(e))
    
    return results


def test_accessibility(page):
    """Basic accessibility checks"""
    results = {
        "site": "accessibility",
        "tests": []
    }
    
    def record_test(name, passed, details=""):
        results["tests"].append({
            "name": name,
            "passed": passed,
            "details": details
        })
        status = "✓" if passed else "✗"
        print(f"  {status} {name}: {details}")
    
    print("\n=== Accessibility Checks ===")
    
    # Test on homepage
    try:
        page.goto("http://localhost:3000", wait_until="networkidle", timeout=15000)
        
        # Check for alt text on images
        images = page.locator("img")
        img_count = images.count()
        images_with_alt = 0
        for i in range(img_count):
            alt = images.nth(i).get_attribute("alt")
            if alt and alt.strip():
                images_with_alt += 1
        
        record_test("Images have alt text", images_with_alt > 0, f"{images_with_alt}/{img_count} images have alt text")
        
        # Check for heading hierarchy
        h1_count = page.locator("h1").count()
        record_test("Has H1 heading", h1_count > 0, f"Found {h1_count} h1 elements")
        
        # Check for landmarks
        main = page.locator("main")
        record_test("Has main landmark", main.count() > 0, f"Found {main.count()} main elements")
        
        nav = page.locator("nav")
        record_test("Has nav landmark", nav.count() > 0, f"Found {nav.count()} nav elements")
        
        # Check form labels
        inputs = page.locator("input:not([type='hidden'])")
        input_count = inputs.count()
        labeled_inputs = 0
        for i in range(input_count):
            input_el = inputs.nth(i)
            id_attr = input_el.get_attribute("id")
            if id_attr:
                label = page.locator(f"label[for='{id_attr}']")
                if label.count() > 0:
                    labeled_inputs += 1
            # Also check aria-label
            aria_label = input_el.get_attribute("aria-label")
            if aria_label:
                labeled_inputs += 1
        
        record_test("Form inputs labeled", labeled_inputs > 0, f"{labeled_inputs}/{input_count} inputs have labels")
        
    except Exception as e:
        record_test("Accessibility check", False, str(e))
    
    return results


def test_console_errors(page):
    """Capture console errors during navigation"""
    results = {
        "site": "console_errors",
        "tests": []
    }
    
    console_errors = []
    page.on("console", lambda msg: console_errors.append({
        "type": msg.type,
        "text": msg.text,
        "location": msg.location
    }) if msg.type == "error" else None)
    
    def record_test(name, passed, details=""):
        results["tests"].append({
            "name": name,
            "passed": passed,
            "details": details
        })
        status = "✓" if passed else "✗"
        print(f"  {status} {name}: {details}")
    
    print("\n=== Console Error Checks ===")
    
    # Navigate through key pages
    pages_to_test = [
        "http://localhost:3000",
        "http://localhost:3000/courses",
        "http://localhost:3000/about",
        "http://localhost:3000/contact",
    ]
    
    for url in pages_to_test:
        console_errors.clear()
        try:
            page.goto(url, wait_until="networkidle", timeout=15000)
            page.wait_for_timeout(1000)  # Wait for any async errors
            
            error_count = len(console_errors)
            record_test(f"No console errors on {url}", error_count == 0, 
                f"Errors: {error_count}" if error_count > 0 else "Clean")
            
            if error_count > 0:
                for err in console_errors[:3]:  # Show first 3
                    print(f"    - {err['text'][:100]}")
        except Exception as e:
            record_test(f"Console check {url}", False, str(e))
    
    return results


def main():
    print("=" * 60)
    print("Airborne Aviation Web Application - Playwright Test Suite")
    print("=" * 60)
    
    all_results = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "public": None,
        "admin": None,
        "accessibility": None,
        "console_errors": None,
        "summary": {}
    }
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Test public website
        all_results["public"] = test_public_website(page)
        
        # Test admin panel
        all_results["admin"] = test_admin_panel(page)
        
        # Accessibility checks
        all_results["accessibility"] = test_accessibility(page)
        
        # Console errors
        all_results["console_errors"] = test_console_errors(page)
        
        browser.close()
    
    # Generate summary
    for key in ["public", "admin", "accessibility", "console_errors"]:
        if all_results[key]:
            tests = all_results[key]["tests"]
            passed = sum(1 for t in tests if t["passed"])
            total = len(tests)
            all_results["summary"][key] = {"passed": passed, "total": total, "rate": f"{passed/total*100:.1f}%" if total > 0 else "N/A"}
    
    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    for site, stats in all_results["summary"].items():
        print(f"  {site}: {stats['passed']}/{stats['total']} ({stats['rate']})")
    
    # Save detailed results
    with open("test_results.json", "w") as f:
        json.dump(all_results, f, indent=2)
    
    print("\nDetailed results saved to test_results.json")
    
    # Exit with error code if any critical tests failed
    total_failed = sum(1 for key in ["public", "admin"] 
                       for t in all_results[key]["tests"] if not t["passed"])
    
    if total_failed > 0:
        print(f"\n⚠ {total_failed} critical tests failed")
        sys.exit(1)
    else:
        print("\n✓ All critical tests passed")
        sys.exit(0)


if __name__ == "__main__":
    main()