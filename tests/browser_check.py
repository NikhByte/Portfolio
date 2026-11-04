"""Run with a server at PORTFOLIO_URL (defaults to localhost:8080).
Requires Python Playwright and its Chromium browser. Contact requests are mocked.
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get('PORTFOLIO_URL', 'http://127.0.0.1:8080')
OUTPUT = Path(os.environ.get('PORTFOLIO_SCREENSHOTS', '/tmp/portfolio-screenshots'))
OUTPUT.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL, wait_until='networkidle')
    for width, height in [(1440,900),(1024,768),(768,1024),(390,844),(320,740)]:
        page.set_viewport_size({'width':width,'height':height})
        page.screenshot(path=str(OUTPUT / f'hero-{width}.png'))
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Overflow at {width}'
    page.set_viewport_size({'width':390,'height':844})
    page.locator('#nav-toggle').click()
    expect(page.locator('#mobile-menu-close')).to_be_focused()
    page.keyboard.press('Shift+Tab')
    expect(page.locator('.mobile-socials a').last).to_be_focused()
    page.keyboard.press('Tab')
    expect(page.locator('#mobile-menu-close')).to_be_focused()
    page.keyboard.press('Escape')
    expect(page.locator('#nav-toggle')).to_be_focused()
    assert not page.locator('main').evaluate('(el) => el.inert')
    page.set_viewport_size({'width':1440,'height':900})
    assert page.locator('.project-card[role], .project-card[tabindex], .featured-project[tabindex]').count() == 0
    assert page.locator('.case-study-trigger[aria-haspopup="dialog"][aria-controls="proj-overlay"]').count() == 6
    assert page.locator('#stack h3.stack-domain-label').count() == 5
    assert page.locator('#work h3.work-role').count() == 4
    assert page.locator('#education h3.edu-degree').count() == 1
    assert page.locator('#writing h3 .writing-post-header').count() == 3
    assert page.locator('.writing-post-body[role="region"][aria-labelledby]').count() == 3
    trigger = page.locator('.case-study-trigger').first
    expect(page.locator('#proj-overlay')).to_have_attribute('inert', '')
    trigger.click()
    expect(page.locator('#proj-overlay')).to_have_attribute('aria-hidden','false')
    assert not page.locator('#proj-overlay').evaluate('(el) => el.inert')
    expect(page.locator('#proj-overlay-close')).to_be_focused()
    page.keyboard.press('Shift+Tab')
    expect(page.locator('#proj-overlay a').last).to_be_focused()
    page.keyboard.press('Tab')
    expect(page.locator('#proj-overlay-close')).to_be_focused()
    page.screenshot(path=str(OUTPUT / 'case-study.png'))
    page.keyboard.press('Escape')
    expect(trigger).to_be_focused()
    assert page.locator('#proj-overlay').evaluate('(el) => el.inert')
    page.locator('[data-filter="hackathons"]').click()
    expect(page.locator('.project-card:visible')).to_have_count(4)
    expect(page.locator('#project-filter-status')).to_have_text('Showing 4 projects for Hackathons.')
    page.locator('[data-filter="all"]').click()
    expect(page.locator('.project-card:visible')).to_have_count(6)
    like = page.locator('.card-like-btn[data-pid="fate"]')
    order = page.locator('.project-card').evaluate_all('(cards) => cards.map(c => c.dataset.pid)')
    like.click()
    page.wait_for_timeout(400)
    expect(like).to_be_focused()
    assert order == page.locator('.project-card').evaluate_all('(cards) => cards.map(c => c.dataset.pid)')
    expect(like).to_have_attribute('aria-pressed','true')
    page.reload(wait_until='networkidle')
    expect(like).to_have_attribute('aria-pressed','true')
    # No messages leave the machine: exercise error and success with intercepted responses.
    calls = []
    def failed(route):
        calls.append(route.request.post_data)
        route.fulfill(status=500, content_type='application/json', body='{}')
    page.route('https://formspree.io/**', failed)
    page.locator('#cf-name').fill('Browser test')
    page.locator('#cf-email').fill('invalid-email')
    page.locator('#cf-message').fill('Local automated test; never sent.')
    page.locator('#cf-submit').click()
    assert not calls
    expect(page.locator('#cf-email')).to_have_attribute('aria-invalid', 'true')
    expect(page.locator('#cf-email-error')).to_have_text('Enter a valid email address.')
    page.locator('#cf-email').fill('test@example.com')
    expect(page.locator('#cf-email')).to_have_attribute('aria-invalid', 'false')
    page.locator('#cf-submit').click()
    expect(page.locator('#cf-status')).to_contain_text('could not be sent')
    expect(page.locator('#cf-message')).to_have_value('Local automated test; never sent.')
    page.unroute('https://formspree.io/**')
    page.route('https://formspree.io/**', lambda route: route.fulfill(status=200, content_type='application/json', body='{}'))
    page.locator('#cf-submit').click()
    expect(page.locator('#cf-status')).to_contain_text('Message sent')
    expect(page.locator('#cf-message')).to_have_value('')
    assert page.locator('#particle-canvas').evaluate('(el) => getComputedStyle(el).display') == 'none'
    page.set_viewport_size({'width':320,'height':740})
    assert page.locator('#cf-name').evaluate('(el) => parseFloat(getComputedStyle(el).fontSize) >= 16')
    page.locator('#contact').screenshot(path=str(OUTPUT / 'contact-320.png'))
    for control in page.locator('a[href]:visible, button:visible').all():
        box = control.bounding_box()
        if box:
            assert box['width'] >= 44 and box['height'] >= 44, (control.get_attribute('class'), control.inner_text(), box)
    panel = page.locator('.writing-post-body').first
    expect(panel).to_be_hidden()
    assert panel.evaluate('(el) => getComputedStyle(el).visibility') == 'hidden'
    page.locator('.writing-post-header').first.click()
    expect(panel).to_be_visible()
    expect(page.locator('.writing-post-header').first).to_have_attribute('aria-expanded', 'true')
    page.locator('#writing').screenshot(path=str(OUTPUT / 'writing-expanded-320.png'))
    assert panel.evaluate('(el) => el.scrollHeight <= el.clientHeight + 1')
    writing_like = page.locator('.writing-post .like-btn').first
    expect(writing_like).to_have_attribute('aria-pressed', 'false')
    writing_like.click()
    expect(writing_like).to_have_attribute('aria-pressed', 'true')
    retina = browser.new_page(viewport={'width':390,'height':844}, device_scale_factor=2)
    retina.on('pageerror', lambda error: errors.append(str(error)))
    retina.goto(URL, wait_until='networkidle')
    assert retina.locator('#particle-canvas').evaluate('(c) => c.width === innerWidth * 2 && c.height === innerHeight * 2')
    retina.set_viewport_size({'width':390,'height':740})
    retina.wait_for_timeout(100)
    assert retina.locator('#particle-canvas').evaluate('(c) => c.width === innerWidth * 2 && c.height === innerHeight * 2')
    retina.emulate_media(reduced_motion='reduce')
    assert retina.locator('#particle-canvas').evaluate('(c) => getComputedStyle(c).display') == 'none'
    retina.close()
    assert not errors, errors
    print('PASS: five viewport widths, focus trapping/restoration, filters, likes persistence, email validation, mocked contact failure/success, reduced motion, no JS errors.')
    browser.close()
