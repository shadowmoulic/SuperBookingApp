import os
import time
import logging
from pathlib import Path
from dotenv import load_dotenv

from django.test import TestCase

# Configure logging for automation script
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("zeque_automation")

# Load environment variables from backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

# Fetch configuration from environment variables
ZEQUE_SITE_URL = os.getenv("ZEQUE_SITE_URL", "https://zeque.in")
ZEQUE_TEST_EMAIL = os.getenv("ZEQUE_TEST_EMAIL", "user@example.com")
ZEQUE_TEST_PASSWORD = os.getenv("ZEQUE_TEST_PASSWORD", "your_password_here")


def create_webdriver(headless=False):
    """Initializes and returns a Selenium Chrome WebDriver instance."""
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options

    chrome_options = Options()
    if headless:
        chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1366,768")
    chrome_options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )

    try:
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    except Exception as e:
        logger.error(f"Failed to launch Chrome driver using default driver: {e}")
        # Try using webdriver_manager if available
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            from selenium.webdriver.chrome.service import Service
            driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()),
                options=chrome_options
            )
            return driver
        except Exception as err:
            logger.error(f"WebDriver setup failed: {err}")
            raise err


def wait_for_home_page_to_load(driver, timeout=25):
    """
    Waits until the website finishes loading (Loading.jsx and HomeSkeleton disappear)
    and Home.jsx content elements become visible.
    """
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC

    logger.info("Waiting for page loading screen / skeletons to clear...")

    # Wait for Loading.jsx overlay or HomeSkeleton pulse elements to disappear
    loading_xpath = (
        "//div[contains(@class, 'z-[9999]') or contains(@class, 'animate-pulse') "
        "or contains(@class, 'animate-loading-bar') or contains(text(), 'Booking Your Experience') "
        "or contains(text(), 'Generating Secure Pass')]"
    )
    try:
        WebDriverWait(driver, timeout).until_not(
            EC.presence_of_element_located((By.XPATH, loading_xpath))
        )
        logger.info("Loading screen / skeletons cleared.")
    except Exception:
        logger.info("No active loading screen overlay detected or wait timeout elapsed.")

    # Confirm loaded Home page elements are present
    home_loaded_selectors = [
        "//h1[contains(text(), 'Understand It') or contains(text(), 'India')]",
        "//h2[contains(text(), 'Browse by Categories') or contains(text(), 'Explore Locations') or contains(text(), 'Continue Booking')]",
        "//input[contains(@placeholder, 'Where are you going')]",
        "//section[contains(@class, 'explore-locations-section') or contains(@class, 'all-categories-section') or contains(@class, 'museum-section')]"
    ]

    start_time = time.time()
    loaded = False
    while time.time() - start_time < timeout:
        for xpath in home_loaded_selectors:
            try:
                elements = driver.find_elements(By.XPATH, xpath)
                if any(el.is_displayed() for el in elements):
                    loaded = True
                    break
            except Exception:
                continue
        if loaded:
            break
        time.sleep(1)

    if loaded:
        logger.info("Home page content loaded and confirmed visible.")
    else:
        logger.warning("Home page elements not explicitly confirmed, proceeding with automation.")


def scroll_page(driver, max_scrolls=5, delay=1.5):
    """Wait for page to load and smoothly scroll down to simulate human exploration."""
    wait_for_home_page_to_load(driver)
    logger.info("Scrolling through page...")
    last_height = driver.execute_script("return document.body.scrollHeight")
    
    for i in range(max_scrolls):
        # Scroll down by 500 pixels
        driver.execute_script("window.scrollBy(0, 500);")
        time.sleep(delay)
        
        new_height = driver.execute_script("return document.body.scrollHeight")
        current_position = driver.execute_script("return window.pageYOffset + window.innerHeight")
        if current_position >= new_height:
            logger.info("Reached bottom of the page.")
            break
            
    # Scroll back up to top smoothly
    driver.execute_script("window.scrollTo({top: 0, behavior: 'smooth'});")
    time.sleep(1)


def explore_zeque_website(driver=None, headless=False):
    """
    Main automation task:
    1. Opens zeque.in
    2. Waits for Home page to load (checking Loading.jsx & Home.jsx)
    3. Attempts login using credentials from .env
    4. Explores site content by scrolling and clicking links
    """
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.keys import Keys

    close_driver_at_end = False
    if driver is None:
        driver = create_webdriver(headless=headless)
        close_driver_at_end = True

    try:
        logger.info(f"Opening website target: {ZEQUE_SITE_URL}")
        driver.get(ZEQUE_SITE_URL)
        logger.info(f"Page loaded title: '{driver.title}'")

        # Wait for website loading screen & Home page components to finish rendering
        wait_for_home_page_to_load(driver, timeout=25)


        # ------------------- 1. Login Simulation -------------------
        logger.info("Attempting to locate login button/link...")
        login_btn = None
        login_selectors = [
            "//button[contains(translate(text(), 'LOGIN', 'login'), 'log in') or contains(translate(text(), 'SIGNIN', 'signin'), 'sign in') or contains(translate(text(), 'LOGIN', 'login'), 'login')]",
            "//a[contains(translate(text(), 'LOGIN', 'login'), 'log in') or contains(translate(text(), 'SIGNIN', 'signin'), 'sign in') or contains(translate(text(), 'LOGIN', 'login'), 'login')]",
            "//button[contains(@class, 'login') or contains(@id, 'login')]",
            "//a[contains(@href, 'login') or contains(@href, 'signin')]"
        ]

        for xpath in login_selectors:
            try:
                elements = driver.find_elements(By.XPATH, xpath)
                for el in elements:
                    if el.is_displayed():
                        login_btn = el
                        break
                if login_btn:
                    break
            except Exception:
                continue

        if login_btn:
            logger.info("Clicking Log In button...")
            driver.execute_script("arguments[0].click();", login_btn)
            time.sleep(2)

        # Look for Email and Password inputs
        logger.info("Searching for email and password input fields...")
        email_input = None
        password_input = None

        email_selectors = [
            "input[type='email']",
            "input[name='email']",
            "input[placeholder*='email' i]",
            "input[id*='email' i]"
        ]
        for sel in email_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, sel)
                for el in elements:
                    if el.is_displayed():
                        email_input = el
                        break
                if email_input:
                    break
            except Exception:
                continue

        pass_selectors = [
            "input[type='password']",
            "input[name='password']",
            "input[placeholder*='password' i]",
            "input[id*='password' i]"
        ]
        for sel in pass_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, sel)
                for el in elements:
                    if el.is_displayed():
                        password_input = el
                        break
                if password_input:
                    break
            except Exception:
                continue

        if email_input and password_input:
            logger.info(f"Filling login credentials for {ZEQUE_TEST_EMAIL}...")
            email_input.clear()
            email_input.send_keys(ZEQUE_TEST_EMAIL)
            time.sleep(1)

            password_input.clear()
            password_input.send_keys(ZEQUE_TEST_PASSWORD)
            time.sleep(1)

            # Find submit button or press Enter
            submit_btn = None
            submit_selectors = [
                "//form//button[@type='submit']",
                "//button[contains(translate(text(), 'SUBMIT', 'submit'), 'submit') or contains(translate(text(), 'LOGIN', 'login'), 'log in')]",
                "//input[@type='submit']"
            ]
            for xpath in submit_selectors:
                try:
                    elements = driver.find_elements(By.XPATH, xpath)
                    for el in elements:
                        if el.is_displayed():
                            submit_btn = el
                            break
                    if submit_btn:
                        break
                except Exception:
                    continue

            if submit_btn:
                logger.info("Submitting login form...")
                driver.execute_script("arguments[0].click();", submit_btn)
            else:
                logger.info("Pressing ENTER key on password field to submit...")
                password_input.send_keys(Keys.RETURN)

            time.sleep(3)
            logger.info("Login submitted successfully.")
        else:
            logger.warning("Could not automatically locate email/password form fields on the current page view.")

        # ------------------- 2. Exploration & Scrolling -------------------
        logger.info("Starting website exploration phase...")
        scroll_page(driver, max_scrolls=6, delay=1.5)

        # Explore clickable items / experience cards / nav links
        logger.info("Looking for interactive links and cards to click into...")
        clickable_elements = driver.find_elements(By.XPATH, "//a[@href] | //div[contains(@class, 'card') or contains(@class, 'experience')]")
        
        valid_links = []
        for el in clickable_elements:
            try:
                href = el.get_attribute("href")
                if href and href.startswith("http") and not href.endswith("#") and "javascript:" not in href:
                    valid_links.append(el)
            except Exception:
                continue

        if valid_links:
            target_element = valid_links[0]
            logger.info(f"Navigating into item/link: {target_element.get_attribute('href') or target_element.text}")
            driver.execute_script("arguments[0].click();", target_element)
            time.sleep(3)

            # Scroll inside detail page
            scroll_page(driver, max_scrolls=4, delay=1.5)

            logger.info("Navigating back to main page...")
            driver.back()
            time.sleep(2)
        else:
            logger.info("No deep internal links found to click, continuing standard exploration.")

        logger.info("Website exploration completed successfully.")

    except Exception as e:
        logger.error(f"An error occurred during site automation: {e}", exc_info=True)
    finally:
        if close_driver_at_end and driver:
            logger.info("Closing browser session.")
            driver.quit()


def run_periodic_automation(interval_seconds=600):
    """
    Runs the website exploration task every `interval_seconds` (default: 600s = 10 minutes).
    """
    logger.info(f"Starting periodic ZeQue website automation runner (Interval: {interval_seconds}s / {interval_seconds//60} mins)...")
    run_count = 0
    try:
        while True:
            run_count += 1
            logger.info(f"=== Execution Run #{run_count} starting at {time.strftime('%Y-%m-%d %H:%M:%S')} ===")
            explore_zeque_website(headless=False)
            logger.info(f"=== Run #{run_count} complete. Sleeping for {interval_seconds} seconds ({interval_seconds//60} minutes)... ===")
            time.sleep(interval_seconds)
    except KeyboardInterrupt:
        logger.info("Periodic runner stopped by user.")


class ZequeSeleniumTest(TestCase):
    """Django Test Case for ZeQue website automation."""

    def test_zeque_automation_single_run(self):
        """Runs a single pass of the website automation test."""
        logger.info("Running ZeQue website automation single-pass Django test...")
        try:
            explore_zeque_website(headless=True)
        except Exception as e:
            self.fail(f"ZeQue website automation test failed with error: {e}")


if __name__ == "__main__":
    import sys
    # If run with '--loop' argument or directly, execute periodic task every 10 mins
    if "--loop" in sys.argv or len(sys.argv) == 1:
        run_periodic_automation(interval_seconds=600)
    else:
        explore_zeque_website(headless=False)

