package models;

import com.avaje.ebean.Model;

import javax.persistence.Entity;
import javax.persistence.Id;
import java.util.Date;
import java.util.List;

@Entity
public class OrderEntry extends Model {

    @Id
    public Long id;

    public String type;

    public String entityCode; //eg LH412

    public String seatType;

    public String refUrl; //Link to carries flight web site

    public Date createdAt = new Date();

    public Date matchedAt;

    public int price;

    public int quantity;

    public static Finder<Long, OrderEntry> find = new Finder<Long, OrderEntry>(
            Long.class, OrderEntry.class
    );

    public static List<OrderEntry> recent() {
        return find.where()
                .orderBy("createdAt desc")
                .setMaxRows(10)
                .findList();
    }
}
