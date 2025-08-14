

package pages;

import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class DécisionPage {

    private WebDriver driver;
    private WebDriverWait wait;

    public DécisionPage(WebDriver driver) {
        if (driver == null) throw new IllegalArgumentException("Driver cannot be null");
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void openDécisionPage() {
        driver.get("http://127.0.0.1:8000/historique");
    }
    public void submitHistorique() {
    // 1. Trouver le bouton (par id "nav-historique")
    WebElement historiqueBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("nav-historique")));

    // 2. Cliquer sur ce bouton
    historiqueBtn.click();

    // 3. Attendre que la page /historique soit bien chargée
    wait.until(ExpectedConditions.urlToBe("http://127.0.0.1:8000/historique"));
}

public void submitDecision() {
    // 1. Trouver le bouton par son id
    WebElement decisionBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("createD2025-06")));

    // 2. Cliquer sur le bouton
    decisionBtn.click();

    // 3. Attendre que l'URL corresponde à la page attendue
    wait.until(ExpectedConditions.urlToBe("http://127.0.0.1:8000/decision/create?date_effet=2025-06"));
}


public void enterObjet176(String objet176) {
        WebElement objetInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("objet176")));
        objetInput.clear(); // Ajouté
        objetInput.sendKeys(objet176);
    }

    public void entertrh176(String trh176) {
        WebElement trhInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("trh176")));
        trhInput.clear(); // Ajouté
        trhInput.sendKeys(trh176);
    }
    public void tav176(String tav176) {
        WebElement tavInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tav176")));
        tavInput.clear(); // Ajouté
        tavInput.sendKeys(tav176);
    }

    public void submitgenerate() {
        WebElement generateBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("generate")));
        generateBtn.click();
    }
    public void submitsave() {
        WebElement saveBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("save")));
        saveBtn.click();
    }


   public String getSuccessMessage() {
    // 1. Attendre que le toast ou le message de succès soit visible
    wait.until(ExpectedConditions.visibilityOfElementLocated(
        By.cssSelector(".toast-success") // adapte ce sélecteur au vrai toast de ton app
    ));

    // 2. Attendre que l'URL soit bien celle de la page décision
    wait.until(ExpectedConditions.urlToBe("http://127.0.0.1:8000/decision"));

    return "Redirection réussie vers la page Décision";
}





}
