
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import models.OrderEntry;
import play.Application;
import play.GlobalSettings;
import play.Logger;
import play.i18n.Messages;
import play.libs.Akka;
import play.libs.F;
import play.mvc.Http;
import play.mvc.Result;
import scala.concurrent.duration.Duration;

import java.util.Date;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import static play.mvc.Results.internalServerError;
import static play.mvc.Results.notFound;

public class Global extends GlobalSettings {

    public double abssin(double x) {
        return Math.abs(Math.sin(x / 5000));
    }

    public int generateDemoData() {
        OrderEntry lastOE = OrderEntry.last();
        double result;
        if (lastOE != null)
            result =  abssin(lastOE.getPeriod()) + abssin(lastOE.createdAt.getTime());
        else {
            result = abssin(new Date().getTime());
        }

        return (int) (result * 110) + 70;

    }

    public void onStart(Application app) {
        Config config = ConfigFactory.load();

//        Logger.info(Akka.system().settings().toString());

        String[] carrierCandidates = {"Lufthansa", "Air Berlin", "British Airways"};
        String[] entityCodeAbrvCandidates = {"LH140", "AB320", "BA650"};


//        if (lastOE != null) {
//            priceBaseline = OrderEntry.last().price + randInt(-20, 20);
//            if (priceBaseline < 10) priceBaseline += 20;
//        }

        Akka.system().scheduler().schedule(
                Duration.create(1, TimeUnit.SECONDS),
                Duration.create(1000, TimeUnit.MILLISECONDS),     //Frequency
                () -> {
                    int pbl = generateDemoData();
                    Logger.debug("" + pbl);

                    for (int i = 0; i < 3; i++) {
                        OrderEntry orderEntry = new OrderEntry();
                        orderEntry.entityCode = entityCodeAbrvCandidates[i];
                        orderEntry.carrier = carrierCandidates[i];
                        orderEntry.price = pbl - i * 10 - randInt(5, 20);
                        orderEntry.quantity = 10 + randInt(1, 5) * 10;
                        orderEntry.seatType = "B";
                        orderEntry.type = randInt(0, 1) == 0 ? "buy" : "sell";
                        orderEntry.save();
                    }
                },
                Akka.system().dispatcher()
        );


    }

    public void onStop(Application app) {
        Logger.info("Global.onStop() callback");
    }

    /**
     * Handle all uncaught exceptions -> Return text only
     *
     * @param request
     * @param t
     * @return
     */
    public F.Promise<Result> onError(Http.RequestHeader request, Throwable t) {
        return F.Promise.<Result>pure(internalServerError(
                Messages.get("error.global", t.getMessage())
        ));
    }


    public F.Promise<Result> onHandlerNotFound(Http.RequestHeader request) {
        return F.Promise.<Result>pure(notFound(
                Messages.get("error.routeNotFound")
        ));
    }

    public static int randInt(int min, int max) {

        // NOTE: Usually this should be a field rather than a method
        // variable so that it is not re-seeded every call.


        // nextInt is normally exclusive of the top value,
        // so add 1 to make it inclusive
        int randomNum = rand.nextInt((max - min) + 1) + min;

        return randomNum;
    }

    private static Random rand = new Random();


    private void startChallengeTimeoutTask() {
        Logger.info("Starting challenge time out task");

//        //Initialize parameters from config file
//        final int timeoutCheckIntervall = (int) ConfigFactory.load().getDuration("challenge.timeout.check.interval", TimeUnit.MINUTES);
//        final int CHALLENGE_MAX_AGE = (int) ConfigFactory.load().getDuration("challenge.timeout.maxAge", TimeUnit.MINUTES);
//        final int CHALLENGE_WARNING_AGE = (int) ConfigFactory.load().getDuration("challenge.timeout.warningAge", TimeUnit.MINUTES);
//
//        Logger.info("Challenge check interval [minutes]: " + timeoutCheckIntervall);
//        Logger.info("Challenge timeout max age [minutes]: " + CHALLENGE_MAX_AGE);
//        Logger.info("Challenge timeout max age [minutes]: " + CHALLENGE_WARNING_AGE);
//
//
//        ActorRef timeoutsActor = Akka.system().actorOf(Props.create(TimoutsChecker.class), "timeouts-actor");
//
//
//        Akka.system().scheduler().schedule(
//                Duration.create(3, TimeUnit.MINUTES), //Initial delay
//                Duration.create(timeoutCheckIntervall, TimeUnit.MINUTES),     //Frequency
//                timeoutsActor,
//                "checkWarnings",
//                Akka.system().dispatcher(),
//                null
//        );
//
//        Akka.system().scheduler().schedule(
//                Duration.create(7, TimeUnit.MINUTES), //Initial delay
//                Duration.create(timeoutCheckIntervall, TimeUnit.MINUTES),     //Frequency
//                timeoutsActor,
//                "checkTimeouts",
//                Akka.system().dispatcher(),
//                null
//        );


    }

}