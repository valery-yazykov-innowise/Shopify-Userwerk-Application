<?php

declare(strict_types=1);

namespace App\Lib;

use App\Exceptions\ShopifyProductCreatorException;
use Shopify\Auth\Session;
use Shopify\Clients\Rest as Rest;
use Shopify\Rest\Admin2023_01\ScriptTag;


class ScriptTagAdder
{
    public static function call(Session $session)
    {
        $client = new Rest($session->getShop(), $session->getAccessToken());

        $client->post('script_tags', [
            "script_tag" => [
                "event" => "onload",
                "display_scope" => "order_status",
                "src" => "https://web.test/js/script.js",
            ],
        ]);
    }
}
