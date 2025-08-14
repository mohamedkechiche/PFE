package pages;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class loginPage {

    private WebDriver driver;
    private WebDriverWait wait;

    // Constructor to initialize WebDriver and WebDriverWait
    public loginPage(WebDriver driver) {
        if (driver == null) throw new IllegalArgumentException("Driver cannot be null");
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }
    public void openLoginPage() {
    driver.get("http://localhost:8000/login");
}


    public void enterEmail(String email) {
        WebElement emailInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("email")));
        emailInput.clear(); // Ajouté
        emailInput.sendKeys(email);
    }

    public void enterPassword(String password) {
        WebElement passwordInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("password")));
        passwordInput.clear(); // Ajouté
        passwordInput.sendKeys(password);
    }

    public void submitLogin() {
        WebElement loginBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button[type='submit']")));
        loginBtn.click();
    }

   public String getSuccessMessage() {
    wait.until(ExpectedConditions.urlToBe("http://127.0.0.1:8000/dashboard"));
    return "Redirection réussie vers le dashboard";
}


public String getErrorMessage() {
    // Sélecteur CSS adapté avec échappement du ":"
    WebElement errorMsg = wait.until(
        ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector(".text-sm.text-red-600.dark\\:text-red-400")
        )
    );
    return errorMsg.getText();
}


}
