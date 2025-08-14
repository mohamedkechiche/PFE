package base;

import java.io.File;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.Date;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import io.github.bonigarcia.wdm.WebDriverManager;

public class TestBase {

    private static WebDriver driver;
    private static WebDriverWait wait;

    public static void setUp() {
    ChromeOptions options = new ChromeOptions();
    options.addArguments("--headless=new"); // headless Chrome
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments("--disable-gpu");
    options.addArguments("--remote-allow-origins=*");

    // Generate a unique user data directory for each test run
    String uniqueUserDir = "/tmp/unique_user_dir_" + System.currentTimeMillis();
    options.addArguments("--user-data-dir=" + uniqueUserDir);

    WebDriverManager.chromedriver().setup();
    driver = new ChromeDriver(options);
    driver.manage().window().setSize(new Dimension(1920, 1080));

}

    public static void tearDown() {
        if (driver != null) {
            driver.quit();
            driver = null;
        }
    }

    public static WebDriver getDriver() {
        return driver;
    }

    public static String captureScreenshot(String scenarioName) {
        try {
            TakesScreenshot screenshotDriver = (TakesScreenshot) driver;
            File screenshotFile = screenshotDriver.getScreenshotAs(OutputType.FILE);

            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd-HHmmss");
            String timestamp = dateFormat.format(new Date());
            String filePath = "target/screenshots/" + scenarioName + "_" + timestamp + ".png";

            File destFile = new File(filePath);
            FileUtils.copyFile(screenshotFile, destFile);

            System.out.println("Screenshot saved to: " + destFile.getAbsolutePath());
            return destFile.getAbsolutePath();
        } catch (Exception e) {
            System.out.println("Error capturing screenshot: " + e.getMessage());
            return "";
        }
    }
}
