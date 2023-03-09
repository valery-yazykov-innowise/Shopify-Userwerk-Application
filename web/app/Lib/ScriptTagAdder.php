<?php

declare(strict_types=1);

namespace App\Lib;

use Illuminate\Support\Facades\Log;
use Shopify\Auth\Session;
use Shopify\Clients\Rest as Rest;
use App\Models\ScriptTag as ScriptTagModel;


class ScriptTagAdder
{
    const PATH_TO_SCRIPT_DIR = '/public/';
    const PATH_TO_START_JS_FILE = 'js/startScript.js';
    const PATH_TO_MAIN_JS_FILE = 'js/';

    public static function call(Session $session, string $scriptLink, $scriptStatus): void
    {
        if (count(ScriptTagModel::where('script_tags.shop', $session->getShop())->get()) === 0) {
            self::generateScriptFile($session, $scriptLink, $scriptStatus[0]);
        } else {
            self::updateScriptTagRecord($session, $scriptLink, $scriptStatus[0]);
        }
    }

    public static function generateScriptFile(Session $session, string $scriptLink, $status): void
    {
        $scriptJsName = self::PATH_TO_MAIN_JS_FILE . 'scriptTag-' . rand(999, 99999) . '.js';
        if (!copy(dirname(__DIR__, 2) . self::PATH_TO_SCRIPT_DIR . self::PATH_TO_START_JS_FILE,
            dirname(__DIR__, 2) . self::PATH_TO_SCRIPT_DIR . $scriptJsName)) {
            Log::error('error with copying file');
        };
        self::updateJsSettings($scriptJsName, $scriptLink, $status);
        self::createScriptTag($session, $scriptJsName);
        self::createScriptTagRecord($session, $scriptLink, $scriptJsName);
    }

    public static function updateScriptTagRecord(Session $session, string $scriptLink, $scriptStatus): void
    {
        $scriptJsName = ScriptTagModel::where('script_tags.shop', $session->getShop())->value('script_file');
        $shop = ['script_link' => $scriptLink, 'status' => $scriptStatus];
        ScriptTagModel::where('script_tags.shop', $session->getShop())->update($shop);
        self::updateJsSettings($scriptJsName, $scriptLink, $scriptStatus);
    }

    public static function createScriptTag(Session $session, string $scriptName): void
    {
        $client = new Rest($session->getShop(), $session->getAccessToken());

        $client->post('script_tags', [
            "script_tag" => [
                "event" => "onload",
                "display_scope" => "order_status",
                "src" => $_ENV['APP_URL'] . '/' . $scriptName,
            ],
        ]);
    }

    public static function createScriptTagRecord(Session $session, string $scriptLink, string $scriptJsName): void
    {
        $shop = ['shop' => $session->getShop(), 'script_file' => $scriptJsName, 'script_link' => $scriptLink, 'status' => false];
        ScriptTagModel::where('script_tags')->insert($shop);
    }

    public static function updateJsSettings(string $scriptJsName, string $scriptLink, string $status): void
    {
        $numStatus = match($status) {
          'Yes' => 1,
          'No' => 0
        };
        $script = file_get_contents($scriptJsName);
        $data = explode(';', $script, 3);
        $data[0] = sprintf("let url = '%s'", $scriptLink);
        $data[1] = sprintf("\r\nlet showPopup = %d", $numStatus); //edit status when on/off is done
        $newScript = implode(';', $data);
        file_put_contents($scriptJsName, $newScript);
    }
}
