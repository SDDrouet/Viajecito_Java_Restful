/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/UnitTests/JUnit5TestClass.java to edit this template
 */
package ec.edu.aerolineas_condor_server.controller;

import ec.edu.aerolineas_condor_server.model.Ciudades;
import jakarta.persistence.EntityManager;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 *
 * @author Drouet
 */
public class CiudadesFacadeRESTTest {
    
    public CiudadesFacadeRESTTest() {
    }
    
    @BeforeAll
    public static void setUpClass() {
    }
    
    @AfterAll
    public static void tearDownClass() {
    }
    
    @BeforeEach
    public void setUp() {
    }
    
    @AfterEach
    public void tearDown() {
    }

    /**
     * Test of create method, of class CiudadesFacadeREST.
     */
    @Test
    public void testCreate() {
        System.out.println("create");
        Ciudades entity = null;
        CiudadesFacadeREST instance = new CiudadesFacadeREST();
        assertEquals(true, true);
    }

    /**
     * Test of edit method, of class CiudadesFacadeREST.
     */
    @Test
    public void testEdit() {
        System.out.println("edit");
        Integer id = null;
        Ciudades entity = null;
        CiudadesFacadeREST instance = new CiudadesFacadeREST();
        assertEquals(true, true);
    }

    /**
     * Test of remove method, of class CiudadesFacadeREST.
     */
    @Test
    public void testRemove() {
        System.out.println("remove");
        Integer id = null;
        CiudadesFacadeREST instance = new CiudadesFacadeREST();
        assertEquals(true, true);
    }

    /**
     * Test of find method, of class CiudadesFacadeREST.
     */
    @Test
    public void testFind() {
        System.out.println("find");
        Integer id = null;
        CiudadesFacadeREST instance = new CiudadesFacadeREST();
        Ciudades expResult = null;
        assertEquals(true, true);
    }

    /**
     * Test of findAll method, of class CiudadesFacadeREST.
     */
    @Test
    public void testFindAll() {
        System.out.println("findAll");
        CiudadesFacadeREST instance = new CiudadesFacadeREST();
        assertEquals(true, true);
    }

    /**
     * Test of findRange method, of class CiudadesFacadeREST.
     */
    @Test
    public void testFindRange() {
        System.out.println("findRange");

        assertEquals(true, true);
    }

    /**
     * Test of countREST method, of class CiudadesFacadeREST.
     */
    @Test
    public void testCountREST() {
        System.out.println("countREST");
        CiudadesFacadeREST instance = new CiudadesFacadeREST();
        String expResult = "";
        assertEquals(true, true);
    }

    /**
     * Test of getEntityManager method, of class CiudadesFacadeREST.
     */
    @Test
    public void testGetEntityManager() {
        System.out.println("getEntityManager");
        CiudadesFacadeREST instance = new CiudadesFacadeREST();
        assertEquals(true, true);
    }
    
}
