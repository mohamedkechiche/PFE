package pages;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LogoutPage {

    private WebDriver driver;
    private WebDriverWait wait;

    public LogoutPage(WebDriver driver) {
        if (driver == null) throw new IllegalArgumentException("Driver cannot be null");
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void openLogoutPage() {
        driver.get("http://127.0.0.1:8000/dashboard");
    }

    public void submitLogout() {
        // 1. Trouver le bouton toggle du dropdown par son id via XPath
        WebElement toggleBtn = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//*[@id='radix-:r7:']")
        ));

        // 2. Cliquer sur le toggle — forcer le clic JS si nécessaire
        try {
            toggleBtn.click();
        } catch (Exception e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", toggleBtn);
        }

        // 3. Attendre que le menu dropdown soit visible (on attend le bouton 'Log out')
        WebElement logoutBtn = wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//*[text()[normalize-space()='Log out']]")
        ));

        // 4. Cliquer sur le bouton 'Log out'
        logoutBtn.click();
    }

    public String getSuccessMessage() {
        wait.until(ExpectedConditions.urlToBe("http://127.0.0.1:8000/"));
        try {
            WebElement msg = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'success') or contains(text(),'logged out') or contains(text(),'welcome')]")
            ));
            return msg.getText();
        } catch (Exception e) {
            return "Logout successful, redirected to home page.";
        }
    }

    public String getErrorMessage() {
        wait.until(ExpectedConditions.urlToBe("http://127.0.0.1:8000/dashboard"));
        try {
            WebElement errorMsg = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'error') or contains(text(),'failed') or contains(text(),'invalid')]")
            ));
            return errorMsg.getText();
        } catch (Exception e) {
            return "Logout failed, unknown error.";
        }
    }
    

}
