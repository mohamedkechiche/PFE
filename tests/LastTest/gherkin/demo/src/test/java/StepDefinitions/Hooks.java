package StepDefinitions;

import base.TestBase;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.Scenario;
import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.MediaEntityBuilder;
import ExtentReport.ExtentManager;

public class Hooks {
    private ExtentReports extentReport = ExtentManager.getInstance();
    public static ExtentTest _scenario;

    @Before
    public void beforeScenario(Scenario scenario) {
        // Initialize WebDriver before each scenario
        TestBase.setUp();
        // Create a test in Extent Reports for each scenario
        _scenario = extentReport.createTest(scenario.getName());
    }

    @After
    public void afterScenario(Scenario scenario) {
        try {
            if (scenario.isFailed()) {
                // Capture screenshot on failure and attach to Extent Report
                String screenshotPath = TestBase.captureScreenshot(scenario.getName());
                if (!screenshotPath.isEmpty()) {
                    _scenario.fail("Scenario Failed", 
                        MediaEntityBuilder.createScreenCaptureFromPath(screenshotPath).build());
                } else {
                    _scenario.fail("Scenario Failed: Screenshot not captured");
                }
            } else {
                _scenario.pass("Scenario Passed");
            }
        } catch (Exception e) {
            _scenario.fail("Error in afterScenario: " + e.getMessage());
        } finally {
            extentReport.flush();
        }


        TestBase.tearDown();
    }
}
