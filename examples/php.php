
<?php

use function CoolNamespace\coolFunc;
use CoolNamespace\Subspace\Whoa;

class HelloWorldTest extends PHPUnit_Framework_TestCase
{
    /**
     * @var PDO
     */
    private $pdo;

    /**
     * A nonsensical function.
     * Learn more: https://thisdoesnotworkprobably.com
     *
     * @param  string $str
     * @param \My_Class $cls
     * @param  integer $int
     * @param  float   $flt
     * @return string
     */
    public function nonsenseFunc(string $str, \My_Class $cls, int $int = 10, float $flt = 5.24) : string
    {
        return coolFunc($str) . ' is great';
    }

    public function setUp()
    {
        $this->pdo = new PDO($GLOBALS['db_dsn'], $GLOBALS['db_username'], $GLOBALS['db_password']);
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->pdo->query("CREATE TABLE hello (what VARCHAR(50) NOT NULL)");

        $this->whoa = new Whoa();
        $this->thing = new \Thing();
        $this->stuff = new CoolNamespace\Stuff();
    }
    public function tearDown()
    {
        $this->pdo->query("DROP TABLE hello");
    }
    public function testHelloWorld()
    {
        $helloWorld = new HelloWorld($this->pdo);
        $this->assertEquals('Hello World', $helloWorld->hello());
    }
    public function testHello()
    {
        $helloWorld = new HelloWorld($this->pdo);
        $this->assertEquals('Hello Bar', $helloWorld->hello('Bar'));
    }
    public function testWhat()
    {
        $helloWorld = new HelloWorld($this->pdo);
        $this->assertFalse($helloWorld->what());
        $helloWorld->hello('Bar');
        $this->assertEquals('Bar', $helloWorld->what());
    }
}


echo 'Hello, world';
